import { DomainError } from './domain.js';

const completedEvents = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'payment_intent.succeeded']);
const pendingEvents = new Set(['payment_intent.processing']);
const failedEvents = new Set(['checkout.session.async_payment_failed', 'payment_intent.payment_failed']);
const expiredEvents = new Set(['checkout.session.expired']);
const refundedEvents = new Set(['charge.refunded']);

export function paymentEventKind(type) {
  if (completedEvents.has(type)) return 'paid';
  if (pendingEvents.has(type)) return 'pending';
  if (failedEvents.has(type)) return 'failed';
  if (expiredEvents.has(type)) return 'expired';
  if (refundedEvents.has(type)) return 'refunded';
  return 'ignored';
}

function metadataValue(metadata, ...keys) {
  for (const key of keys) {
    if (typeof metadata?.[key] === 'string' && metadata[key].trim()) return metadata[key].trim();
  }
  return null;
}

function integerValue(...values) {
  const value = values.find(candidate => candidate !== undefined && candidate !== null);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function extractPaymentDetails(event) {
  const object = event?.data?.object || {};
  const metadata = object.metadata || {};
  return {
    bookingReference: metadataValue(metadata, 'bookingReference', 'booking_reference'),
    providerReference: typeof object.payment_intent === 'string' ? object.payment_intent : (typeof object.id === 'string' ? object.id : null),
    amountCents: integerValue(object.amount_total, object.amount_received, object.amount),
    refundAmountCents: integerValue(object.amount_refunded, object.amount),
    currency: typeof object.currency === 'string' ? object.currency.toUpperCase() : null,
    paymentStatus: typeof object.payment_status === 'string' ? object.payment_status : null
  };
}

export function assertPaymentMatches(details, payment) {
  if (details.amountCents !== null && details.amountCents !== Number(payment.amount_cents)) {
    throw new DomainError('PAYMENT_AMOUNT_MISMATCH', 'The provider amount does not match the booking payment.', 400, {
      expectedCents: Number(payment.amount_cents),
      receivedCents: details.amountCents
    });
  }
  const expectedCurrency = String(payment.currency || '').trim().toUpperCase();
  if (details.currency && expectedCurrency && details.currency !== expectedCurrency) {
    throw new DomainError('PAYMENT_CURRENCY_MISMATCH', 'The provider currency does not match the booking payment.', 400, {
      expectedCurrency,
      receivedCurrency: details.currency
    });
  }
  if (details.amountCents === null && payment.status !== 'paid') {
    throw new DomainError('PAYMENT_AMOUNT_MISSING', 'The provider event did not include a verifiable payment amount.', 400);
  }
}

function paymentLookup(details) {
  if (details.bookingReference) return { clause: 'b.reference=$1', value: details.bookingReference };
  if (details.providerReference) return { clause: 'p.provider_reference=$1', value: details.providerReference };
  return null;
}

function isActiveBooking(status) {
  return ['held', 'awaiting_payment', 'confirmed', 'checked_in'].includes(status);
}

export async function reconcileStripeEvent(event, transaction) {
  if (!event?.id || !event?.type) throw new DomainError('PAYMENT_WEBHOOK_INVALID', 'Stripe event id and type are required.', 400);
  if (typeof transaction !== 'function') throw new TypeError('A transaction callback is required.');
  const kind = paymentEventKind(event.type);
  return transaction(async client => {
    const inserted = await client.query(
      'INSERT INTO payment_events (provider_event_id,event_type,payload) VALUES ($1,$2,$3) ON CONFLICT (provider_event_id) DO NOTHING RETURNING id',
      [event.id, event.type, event]
    );
    if (!inserted.rowCount) return { duplicate: true, processed: false };
    if (kind === 'ignored') return { duplicate: false, processed: false, ignored: true };

    const details = extractPaymentDetails(event);
    const lookup = paymentLookup(details);
    if (!lookup) throw new DomainError('PAYMENT_BOOKING_REFERENCE_MISSING', 'The payment event cannot be linked to a booking.', 400);
    const result = await client.query(`SELECT p.id AS payment_id,p.booking_id,p.status AS payment_record_status,p.amount_cents,p.currency AS payment_currency,p.provider_reference,
      b.reference,b.status AS booking_status,b.payment_status AS booking_payment_status,b.total_cents,b.currency AS booking_currency
      FROM payments p JOIN bookings b ON b.id=p.booking_id WHERE ${lookup.clause} FOR UPDATE`, [lookup.value]);
    if (!result.rowCount) throw new DomainError('PAYMENT_BOOKING_NOT_FOUND', 'The payment event does not match a known booking.', 404);
    const payment = result.rows[0];
    if (details.bookingReference && Number(payment.total_cents) !== Number(payment.amount_cents)) {
      throw new DomainError('PAYMENT_RECORD_INCONSISTENT', 'The booking and payment amounts do not match.', 409);
    }
    if (kind === 'paid' && event.type.startsWith('checkout.session.') && details.paymentStatus && details.paymentStatus !== 'paid') {
      throw new DomainError('PAYMENT_NOT_SETTLED', 'The checkout session is not marked as paid.', 409);
    }
    if (['paid', 'pending', 'refunded'].includes(kind)) {
      const matchDetails = { ...details, amountCents: kind === 'refunded' ? details.refundAmountCents : details.amountCents };
      assertPaymentMatches(matchDetails, { amount_cents: payment.amount_cents, currency: payment.payment_currency, status: payment.payment_record_status });
    }
    await client.query('UPDATE payment_events SET payment_id=$2 WHERE id=$1', [inserted.rows[0].id, payment.payment_id]);

    if (kind === 'paid') {
      if (!isActiveBooking(payment.booking_status)) throw new DomainError('PAYMENT_BOOKING_NOT_PAYABLE', 'The booking is no longer payable.', 409);
      const nextStatus = ['held', 'awaiting_payment'].includes(payment.booking_status) ? 'confirmed' : payment.booking_status;
      await client.query("UPDATE payments SET provider='stripe',status='paid',provider_reference=COALESCE($2,provider_reference),updated_at=now() WHERE id=$1", [payment.payment_id, details.providerReference]);
      await client.query("UPDATE bookings SET status=$2,payment_status='paid',updated_at=now() WHERE id=$1", [payment.booking_id, nextStatus]);
      if (nextStatus !== payment.booking_status) {
        await client.query('INSERT INTO booking_events (booking_id,from_status,to_status,metadata) VALUES ($1,$2,$3,$4)', [payment.booking_id, payment.booking_status, nextStatus, JSON.stringify({ source: 'stripe_webhook', eventId: event.id })]);
      }
      await client.query('INSERT INTO audit_logs (actor_user_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5)', [null, 'payment.webhook.reconciled', 'payment', String(payment.payment_id), JSON.stringify({ bookingReference: payment.reference, eventId: event.id, status: 'paid' })]);
      return { duplicate: false, processed: true, status: 'paid' };
    }

    if (kind === 'pending') {
      await client.query("UPDATE payments SET provider='stripe',status='pending',provider_reference=COALESCE($2,provider_reference),updated_at=now() WHERE id=$1", [payment.payment_id, details.providerReference]);
      await client.query("UPDATE bookings SET payment_status='pending',updated_at=now() WHERE id=$1", [payment.booking_id]);
      return { duplicate: false, processed: true, status: 'pending' };
    }

    if (kind === 'failed' || kind === 'expired') {
      const nextBookingStatus = kind === 'expired' && ['held', 'awaiting_payment'].includes(payment.booking_status) ? 'expired' : payment.booking_status;
      await client.query("UPDATE payments SET provider='stripe',status='failed',provider_reference=COALESCE($2,provider_reference),updated_at=now() WHERE id=$1", [payment.payment_id, details.providerReference]);
      await client.query("UPDATE bookings SET status=$2,payment_status='failed',updated_at=now() WHERE id=$1", [payment.booking_id, nextBookingStatus]);
      if (nextBookingStatus !== payment.booking_status) {
        await client.query('INSERT INTO booking_events (booking_id,from_status,to_status,metadata) VALUES ($1,$2,$3,$4)', [payment.booking_id, payment.booking_status, nextBookingStatus, JSON.stringify({ source: 'stripe_webhook', eventId: event.id })]);
      }
      await client.query('INSERT INTO audit_logs (actor_user_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5)', [null, 'payment.webhook.reconciled', 'payment', String(payment.payment_id), JSON.stringify({ bookingReference: payment.reference, eventId: event.id, status: 'failed' })]);
      return { duplicate: false, processed: true, status: 'failed' };
    }

    const refundAmount = details.refundAmountCents ?? details.amountCents;
    const fullyRefunded = refundAmount !== null && refundAmount >= Number(payment.amount_cents);
    const refundStatus = fullyRefunded ? 'refunded' : 'partially_refunded';
    await client.query("UPDATE payments SET provider='stripe',status=$2,provider_reference=COALESCE($3,provider_reference),updated_at=now() WHERE id=$1", [payment.payment_id, refundStatus, details.providerReference]);
    await client.query('UPDATE bookings SET payment_status=$2,updated_at=now() WHERE id=$1', [payment.booking_id, refundStatus]);
    await client.query('INSERT INTO refunds (payment_id,amount_cents,status,provider_reference) VALUES ($1,$2,$3,$4)', [payment.payment_id, refundAmount ?? 0, 'succeeded', details.providerReference]);
    await client.query('INSERT INTO audit_logs (actor_user_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5)', [null, 'payment.webhook.reconciled', 'payment', String(payment.payment_id), JSON.stringify({ bookingReference: payment.reference, eventId: event.id, status: refundStatus })]);
    return { duplicate: false, processed: true, status: refundStatus };
  });
}
