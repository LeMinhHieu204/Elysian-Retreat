import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardReadRoles, requireRole } from '../server/lib/authorization.js';
import { assertPaymentMatches, extractPaymentDetails, paymentEventKind, reconcileStripeEvent } from '../server/lib/payment-reconciliation.js';
import { assertCmsEditor, normalizePageInput } from '../server/lib/cms.js';

test('dashboard and booking reads exclude housekeeping and content editor roles', () => {
  assert.deepEqual(dashboardReadRoles, ['super_admin', 'hotel_manager', 'front_desk', 'reservations_staff']);
  assert.doesNotThrow(() => requireRole({ role: 'front_desk' }, dashboardReadRoles));
  assert.throws(() => requireRole({ role: 'housekeeping' }, dashboardReadRoles), error => error.code === 'FORBIDDEN' && error.status === 403);
  assert.throws(() => requireRole({ role: 'content_editor' }, dashboardReadRoles), error => error.code === 'FORBIDDEN' && error.status === 403);
});

test('CMS editor permissions and plain-text XSS boundary are explicit', () => {
  assert.doesNotThrow(() => assertCmsEditor({ role: 'content_editor' }));
  assert.throws(() => assertCmsEditor({ role: 'housekeeping' }), error => error.code === 'FORBIDDEN' && error.status === 403);
  assert.deepEqual(normalizePageInput({ slug: 'about', title: 'About', body: 'A calm place.' }), { slug: 'about', title: 'About', body: 'A calm place.' });
  assert.throws(() => normalizePageInput({ slug: 'about', title: 'About', body: '<script>alert(1)</script>' }), error => error.code === 'VALIDATION_ERROR');
});

test('Stripe payment details expose booking identity, amount, currency and provider reference', () => {
  const details = extractPaymentDetails({
    id: 'evt_paid_1',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_1', payment_intent: 'pi_1', amount_total: 12500, currency: 'eur', payment_status: 'paid', metadata: { bookingReference: 'ELY-2099-ABC123' } } }
  });
  assert.deepEqual(details, { bookingReference: 'ELY-2099-ABC123', providerReference: 'pi_1', amountCents: 12500, refundAmountCents: null, currency: 'EUR', paymentStatus: 'paid' });
  assert.equal(paymentEventKind('checkout.session.completed'), 'paid');
  assert.equal(paymentEventKind('checkout.session.expired'), 'expired');
  assert.equal(paymentEventKind('charge.refunded'), 'refunded');
});

test('Stripe reconciliation rejects amount and currency mismatches', () => {
  assert.throws(() => assertPaymentMatches({ amountCents: 12000, currency: 'EUR' }, { amount_cents: 12500, currency: 'EUR', status: 'unpaid' }), error => error.code === 'PAYMENT_AMOUNT_MISMATCH');
  assert.throws(() => assertPaymentMatches({ amountCents: 12500, currency: 'USD' }, { amount_cents: 12500, currency: 'EUR', status: 'unpaid' }), error => error.code === 'PAYMENT_CURRENCY_MISMATCH');
  assert.throws(() => assertPaymentMatches({ amountCents: null, currency: 'EUR' }, { amount_cents: 12500, currency: 'EUR', status: 'unpaid' }), error => error.code === 'PAYMENT_AMOUNT_MISSING');
});

test('Stripe reconciliation updates a matching payment once and deduplicates a replay', async () => {
  const calls = [];
  let alreadyInserted = false;
  const client = {
    async query(sql, params) {
      calls.push({ sql, params });
      if (sql.startsWith('INSERT INTO payment_events')) {
        if (alreadyInserted) return { rowCount: 0, rows: [] };
        alreadyInserted = true;
        return { rowCount: 1, rows: [{ id: 91 }] };
      }
      if (sql.startsWith('SELECT p.id AS payment_id')) return {
        rowCount: 1,
        rows: [{ payment_id: 7, booking_id: 8, payment_record_status: 'unpaid', amount_cents: 12500, payment_currency: 'EUR', provider_reference: null, reference: 'ELY-2099-ABC123', booking_status: 'awaiting_payment', booking_payment_status: 'unpaid', total_cents: 12500, booking_currency: 'EUR' }]
      };
      return { rowCount: 1, rows: [] };
    }
  };
  const transaction = async work => work(client);
  const event = { id: 'evt_paid_2', type: 'checkout.session.completed', data: { object: { id: 'cs_2', payment_intent: 'pi_2', amount_total: 12500, currency: 'eur', payment_status: 'paid', metadata: { bookingReference: 'ELY-2099-ABC123' } } } };
  assert.deepEqual(await reconcileStripeEvent(event, transaction), { duplicate: false, processed: true, status: 'paid' });
  assert.deepEqual(await reconcileStripeEvent(event, transaction), { duplicate: true, processed: false });
  assert.ok(calls.some(call => call.sql.startsWith("UPDATE payments SET provider='stripe',status='paid'")));
  assert.ok(calls.some(call => call.sql.startsWith('UPDATE payment_events SET payment_id')));
});
