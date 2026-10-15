import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { pool, query, withTransaction } from './lib/db.js';
import { DomainError, assertDateRange, assertOccupancy, calculateQuote, bookingReference, activeBookingStatuses, assertTransition } from './lib/domain.js';
import { hashPassword, verifyPassword, createSession, getSession, sessionCookie, csrfCookie, clearSessionCookie, requireCsrf, parseCookies, hashToken, randomToken } from './lib/security.js';
import { verifyStripeSignature, providerStatus } from './lib/payments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 4173);

const jsonHeaders = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function send(response, status, payload, headers = {}) {
  response.writeHead(status, { ...jsonHeaders, ...headers });
  response.end(JSON.stringify(payload));
}

function ok(response, data, status = 200, headers = {}) { send(response, status, { ok: true, data }, headers); }
function fail(response, error) {
  if (error?.code === '23P01' || error?.code === '40001') error = new DomainError('BOOKING_CONFLICT', 'The last available room was just taken. Please search again.', 409);
  const normalized = error instanceof DomainError ? error : new DomainError('INTERNAL_ERROR', process.env.NODE_ENV === 'production' ? 'Something went wrong.' : error.message, 500);
  send(response, normalized.status || 500, { ok: false, error: { code: normalized.code, message: normalized.message, details: normalized.details || {} } });
}

async function readJson(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > 1024 * 1024) throw new DomainError('PAYLOAD_TOO_LARGE', 'Request body is too large.', 413);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new DomainError('VALIDATION_ERROR', 'Request body must be valid JSON.'); }
}

async function readRaw(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) { total += chunk.length; if (total > 1024 * 1024) throw new DomainError('PAYLOAD_TOO_LARGE', 'Request body is too large.', 413); chunks.push(chunk); }
  return Buffer.concat(chunks).toString('utf8');
}

function requiredString(value, field, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new DomainError('VALIDATION_ERROR', `${field} is required.`);
  return value.trim();
}

function email(value) {
  const normalized = requiredString(value, 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new DomainError('VALIDATION_ERROR', 'Enter a valid email address.');
  return normalized;
}

async function roomBySlug(slug, client = { query }) {
  const result = await client.query(`SELECT rt.*, rp.id AS rate_plan_id, rp.name AS rate_plan_name, rp.breakfast_included, rp.cancellation_window_days
    FROM room_types rt LEFT JOIN rate_plans rp ON rp.room_type_id = rt.id AND rp.slug = 'flexible'
    WHERE rt.slug = $1 AND rt.is_active = true`, [slug]);
  if (!result.rowCount) throw new DomainError('ROOM_NOT_FOUND', 'That room type could not be found.', 404);
  const room = result.rows[0];
  const images = await client.query('SELECT url, alt_text, sort_order FROM room_images WHERE room_type_id = $1 ORDER BY sort_order, id', [room.id]);
  const amenities = await client.query(`SELECT a.name FROM amenities a JOIN room_type_amenities rta ON rta.amenity_id = a.id WHERE rta.room_type_id = $1 ORDER BY a.name`, [room.id]);
  return { ...room, images: images.rows, amenities: amenities.rows.map(item => item.name) };
}

async function listRooms() {
  const result = await query(`SELECT rt.slug, rt.category AS type, rt.name, rt.short_description AS short, rt.description,
    rt.base_price_cents, rt.max_adults AS guests, rt.max_children, rt.area_m2 AS area, rt.bed_type AS bed,
    COUNT(DISTINCT ru.id)::int AS unit_count
    FROM room_types rt LEFT JOIN room_units ru ON ru.room_type_id = rt.id
    WHERE rt.is_active = true GROUP BY rt.id ORDER BY rt.base_price_cents`);
  return Promise.all(result.rows.map(async row => {
    const room = await roomBySlug(row.slug);
    return { ...row, price: row.base_price_cents / 100, images: room.images, amenities: room.amenities, ratePlan: room.rate_plan_name };
  }));
}

async function buildQuote(client, input) {
  const room = await roomBySlug(input.roomSlug, client);
  const nights = assertDateRange(input.checkIn, input.checkOut);
  const occupancy = assertOccupancy(room, input.adults, input.children || 0);
  const rates = await client.query(`SELECT series.stay_date::date AS stay_date,
      COALESCE((SELECT sr.nightly_price_cents FROM seasonal_rates sr WHERE sr.room_type_id = $1 AND sr.starts_on <= series.stay_date::date AND sr.ends_on > series.stay_date::date ORDER BY sr.starts_on DESC LIMIT 1), $4) AS price_cents
    FROM generate_series($2::date, ($3::date - INTERVAL '1 day'), INTERVAL '1 day') AS series(stay_date)`, [room.id, input.checkIn, input.checkOut, room.base_price_cents]);
  const nightlyRates = rates.rows.map(row => ({ stay_date: row.stay_date, price_cents: Number(row.price_cents) }));
  const quote = calculateQuote(room, nights, nightlyRates, input.promoCode);
  const availability = await client.query(`SELECT ru.id, ru.code FROM room_units ru
    WHERE ru.room_type_id = $1 AND ru.status = 'available'
      AND NOT EXISTS (SELECT 1 FROM maintenance_blocks mb WHERE mb.room_unit_id = ru.id AND daterange(mb.starts_on, mb.ends_on, '[)') && daterange($2::date, $3::date, '[)'))
      AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.room_unit_id = ru.id AND b.status = ANY($4::text[]) AND daterange(b.check_in, b.check_out, '[)') && daterange($2::date, $3::date, '[)'))
      AND NOT EXISTS (SELECT 1 FROM reservation_holds h WHERE h.room_unit_id = ru.id AND h.status = 'active' AND h.expires_at > now() AND daterange(h.check_in, h.check_out, '[)') && daterange($2::date, $3::date, '[)'))
    ORDER BY ru.id`, [room.id, input.checkIn, input.checkOut, activeBookingStatuses]);
  return { room, nights, occupancy, quote, availableUnits: availability.rows.map(row => row.code), available: availability.rowCount > 0 };
}

async function createBooking(input, session = null) {
  return withTransaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    const idempotencyKey = input.idempotencyKey ? requiredString(input.idempotencyKey, 'Idempotency key', 120) : null;
    if (idempotencyKey) {
      const existing = await client.query(`SELECT b.* FROM bookings b WHERE b.idempotency_key=$1 AND (b.user_id=$2 OR (b.user_id IS NULL AND $2 IS NULL))`, [idempotencyKey, session?.user_id || null]);
      if (existing.rowCount) return { booking: existing.rows[0], quote: null, room: await roomBySlug(input.roomSlug, client) };
    }
    const built = await buildQuote(client, input);
    if (!built.available) throw new DomainError('ROOM_UNAVAILABLE', 'No eligible physical room is available for those dates.', 409, { roomSlug: input.roomSlug });
    let roomUnitIds;
    if (input.holdToken) {
      const held = await client.query("SELECT room_unit_id FROM reservation_holds WHERE hold_token=$1 AND status='active' AND expires_at>now() FOR UPDATE", [input.holdToken]);
      if (!held.rowCount) throw new DomainError('HOLD_EXPIRED', 'That reservation hold has expired. Please search again.', 409);
      roomUnitIds = { rows: [{ id: held.rows[0].room_unit_id }] };
    } else roomUnitIds = await client.query(`SELECT ru.id FROM room_units ru WHERE ru.room_type_id = $1 AND ru.status = 'available'
      AND NOT EXISTS (SELECT 1 FROM maintenance_blocks mb WHERE mb.room_unit_id = ru.id AND daterange(mb.starts_on, mb.ends_on, '[)') && daterange($2::date, $3::date, '[)'))
      AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.room_unit_id = ru.id AND b.status = ANY($4::text[]) AND daterange(b.check_in, b.check_out, '[)') && daterange($2::date, $3::date, '[)'))
      AND NOT EXISTS (SELECT 1 FROM reservation_holds h WHERE h.room_unit_id = ru.id AND h.status = 'active' AND h.expires_at > now() AND daterange(h.check_in, h.check_out, '[)') && daterange($2::date, $3::date, '[)')) ORDER BY ru.id`, [built.room.id, input.checkIn, input.checkOut, activeBookingStatuses]);
    const paymentMethod = input.paymentMethod === 'demo' ? 'demo' : 'pay_at_property';
    const status = 'confirmed';
    const paymentStatus = paymentMethod === 'demo' ? 'paid' : 'unpaid';
    let inserted;
    for (const candidate of roomUnitIds.rows) {
      try {
        inserted = await client.query(`INSERT INTO bookings (reference, user_id, room_type_id, room_unit_id, rate_plan_id, status, payment_status, check_in, check_out, adults, children, subtotal_cents, discount_cents, tax_cents, service_fee_cents, total_cents, nightly_rates, cancellation_policy, guest_snapshot, expires_at, idempotency_key)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *`, [
          bookingReference(), session?.user_id || null, built.room.id, candidate.id, built.room.rate_plan_id, status, paymentStatus, input.checkIn, input.checkOut, built.occupancy.adults, built.occupancy.children,
          built.quote.subtotalCents, built.quote.discountCents, built.quote.taxCents, built.quote.serviceFeeCents, built.quote.totalCents, JSON.stringify(built.quote.nightlyRates), JSON.stringify({ freeCancellationUntilDaysBefore: built.room.cancellation_window_days ?? 7 }), JSON.stringify(input.guest), status === 'awaiting_payment' ? new Date(Date.now() + 15 * 60_000) : null, idempotencyKey
        ]);
        break;
      } catch (error) {
        if (error.code !== '23P01') throw error;
      }
    }
    if (!inserted) throw new DomainError('BOOKING_CONFLICT', 'The last available room was just taken. Please search again.', 409);
    const booking = inserted.rows[0];
    if (input.holdToken) await client.query("UPDATE reservation_holds SET status='converted' WHERE hold_token=$1", [input.holdToken]);
    await client.query('INSERT INTO booking_events (booking_id, to_status, actor_user_id, metadata) VALUES ($1,$2,$3,$4)', [booking.id, status, session?.user_id || null, JSON.stringify({ source: 'guest_checkout' })]);
    await client.query('INSERT INTO payments (booking_id, provider, status, amount_cents) VALUES ($1,$2,$3,$4)', [booking.id, paymentMethod, paymentStatus, booking.total_cents]);
    return { booking, quote: built.quote, room: built.room };
  });
}

async function requireSession(request) {
  const session = await getSession(request);
  if (!session) throw new DomainError('UNAUTHORIZED', 'Please sign in to continue.', 401);
  return session;
}

async function requireAdmin(request) {
  const session = await requireSession(request);
  if (!['super_admin','hotel_manager','front_desk','reservations_staff','housekeeping','content_editor'].includes(session.role)) throw new DomainError('FORBIDDEN', 'Admin access is required.', 403);
  return session;
}

function requireRole(session, roles) {
  if (!roles.includes(session.role)) throw new DomainError('FORBIDDEN', 'Your staff role cannot perform this operation.', 403);
}

async function authRegister(body, response) {
  const normalizedEmail = email(body.email);
  const password = requiredString(body.password, 'Password', 200);
  if (password.length < 12) throw new DomainError('VALIDATION_ERROR', 'Password must be at least 12 characters.');
  const displayName = requiredString(body.displayName || body.name, 'Display name', 120);
  const user = await query('INSERT INTO users (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id,email,display_name,role', [normalizedEmail, await hashPassword(password), displayName]).catch(error => {
    if (error.code === '23505') throw new DomainError('EMAIL_EXISTS', 'An account with that email already exists.', 409);
    throw error;
  });
  const session = await createSession(user.rows[0].id);
  ok(response, { user: user.rows[0], csrfToken: session.csrf }, 201, { 'set-cookie': [sessionCookie(session.token), csrfCookie(session.csrf)] });
}

async function authLogin(body, response) {
  const normalizedEmail = email(body.email);
  const password = requiredString(body.password, 'Password', 200);
  const result = await query('SELECT id,email,display_name,role,password_hash FROM users WHERE email = $1 AND is_active = true', [normalizedEmail]);
  if (!result.rowCount || !(await verifyPassword(password, result.rows[0].password_hash))) throw new DomainError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
  const session = await createSession(result.rows[0].id);
  const { password_hash: _password, ...user } = result.rows[0];
  ok(response, { user, csrfToken: session.csrf }, 200, { 'set-cookie': [sessionCookie(session.token), csrfCookie(session.csrf)] });
}

async function handleApi(request, response, pathname, method) {
  if (method === 'GET' && pathname === '/api/health') {
    try { await query('SELECT 1'); ok(response, { status: 'ok', database: 'connected' }); } catch { ok(response, { status: 'degraded', database: 'unavailable' }, 503); }
    return;
  }
  if (method === 'GET' && pathname === '/api/payments/providers') { ok(response, providerStatus()); return; }
  if (method === 'GET' && pathname === '/api/rooms') { ok(response, await listRooms()); return; }
  if (method === 'GET' && pathname.startsWith('/api/rooms/')) { const room = await roomBySlug(pathname.split('/').pop()); ok(response, room); return; }
  if (method === 'POST' && pathname === '/api/availability/quote') { ok(response, await buildQuote({ query }, await readJson(request))); return; }
  if (method === 'POST' && pathname === '/api/bookings/hold') {
    const input = await readJson(request);
    const hold = await withTransaction(async client => {
      await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      const built = await buildQuote(client, input);
      const candidate = await client.query(`SELECT ru.id,ru.code FROM room_units ru WHERE ru.room_type_id=$1 AND ru.status='available'
        AND NOT EXISTS (SELECT 1 FROM maintenance_blocks mb WHERE mb.room_unit_id=ru.id AND daterange(mb.starts_on,mb.ends_on,'[)') && daterange($2::date,$3::date,'[)'))
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.room_unit_id=ru.id AND b.status=ANY($4::text[]) AND daterange(b.check_in,b.check_out,'[)') && daterange($2::date,$3::date,'[)'))
        AND NOT EXISTS (SELECT 1 FROM reservation_holds h WHERE h.room_unit_id=ru.id AND h.status='active' AND h.expires_at>now() AND daterange(h.check_in,h.check_out,'[)') && daterange($2::date,$3::date,'[)'))
        ORDER BY ru.id FOR UPDATE SKIP LOCKED LIMIT 1`, [built.room.id, input.checkIn, input.checkOut, activeBookingStatuses]);
      if (!candidate.rowCount) throw new DomainError('ROOM_UNAVAILABLE', 'No eligible physical room is available for those dates.', 409);
      const holdToken = randomToken(24); const expiresAt = new Date(Date.now() + 15 * 60_000);
      await client.query('INSERT INTO reservation_holds (hold_token,room_type_id,room_unit_id,check_in,check_out,expires_at) VALUES ($1,$2,$3,$4,$5,$6)', [holdToken,built.room.id,candidate.rows[0].id,input.checkIn,input.checkOut,expiresAt]);
      return { holdToken, expiresAt, roomUnit: candidate.rows[0].code, quote: built.quote };
    });
    ok(response, hold, 201); return;
  }
  if (method === 'POST' && pathname.startsWith('/api/bookings/hold/') && pathname.endsWith('/release')) {
    const token = pathname.split('/')[4]; await query("UPDATE reservation_holds SET status='released' WHERE hold_token=$1 AND status='active'", [token]); ok(response, { released: true }); return;
  }
  if (method === 'POST' && pathname === '/api/bookings') {
    const body = await readJson(request);
    const session = await getSession(request);
    const guest = { name: requiredString(body.guest?.name || body.guestName, 'Guest name', 160), email: email(body.guest?.email || body.email), phone: String(body.guest?.phone || body.phone || '').slice(0, 50) };
    const result = await createBooking({ ...body, guest }, session);
    ok(response, { reference: result.booking.reference, status: result.booking.status, paymentStatus: result.booking.payment_status, totalCents: result.booking.total_cents, currency: result.booking.currency, room: result.room.name, checkIn: result.booking.check_in, checkOut: result.booking.check_out }, 201);
    return;
  }
  if (method === 'POST' && pathname === '/api/auth/register') { await authRegister(await readJson(request), response); return; }
  if (method === 'POST' && pathname === '/api/auth/login') { await authLogin(await readJson(request), response); return; }
  if (method === 'POST' && pathname === '/api/auth/forgot-password') {
    const body = await readJson(request); const normalizedEmail = email(body.email); const user = await query('SELECT id FROM users WHERE email=$1 AND is_active=true', [normalizedEmail]);
    if (user.rowCount) { const token = randomToken(32); await query('INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES ($1,$2,now()+INTERVAL \'1 hour\')', [user.rows[0].id, hashToken(token)]); }
    ok(response, { accepted: true }); return;
  }
  if (method === 'POST' && pathname === '/api/auth/reset-password') {
    const body = await readJson(request); const token = requiredString(body.token, 'Reset token', 200); const password = requiredString(body.password, 'Password', 200); if (password.length < 12) throw new DomainError('VALIDATION_ERROR', 'Password must be at least 12 characters.');
    const result = await query('SELECT id,user_id FROM password_reset_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now()', [hashToken(token)]); if (!result.rowCount) throw new DomainError('INVALID_RESET_TOKEN', 'That password reset link is invalid or expired.', 400);
    await withTransaction(async client => { await client.query('UPDATE users SET password_hash=$2,updated_at=now() WHERE id=$1', [result.rows[0].user_id, await hashPassword(password)]); await client.query('UPDATE password_reset_tokens SET used_at=now() WHERE id=$1', [result.rows[0].id]); await client.query('DELETE FROM sessions WHERE user_id=$1', [result.rows[0].user_id]); });
    ok(response, { reset: true }); return;
  }
  if (method === 'POST' && pathname === '/api/auth/logout') { const session = await getSession(request); if (session) await query('DELETE FROM sessions WHERE id = $1', [session.id]); ok(response, { loggedOut: true }, 200, { 'set-cookie': clearSessionCookie() }); return; }
  if (method === 'GET' && pathname === '/api/auth/me') { const session = await getSession(request); ok(response, { user: session ? { id: session.user_id, email: session.email, displayName: session.display_name, role: session.role } : null, csrfToken: session ? parseCookies(request).elysian_csrf || null : null }); return; }
  if (method === 'GET' && pathname === '/api/account/profile') { const session = await requireSession(request); const result = await query('SELECT id,email,display_name,role,email_verified_at FROM users WHERE id=$1', [session.user_id]); ok(response, result.rows[0]); return; }
  if (method === 'PATCH' && pathname === '/api/account/profile') {
    const session = await requireSession(request); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403); const body = await readJson(request);
    const result = await query('UPDATE users SET display_name=COALESCE($2,display_name),updated_at=now() WHERE id=$1 RETURNING id,email,display_name,role,email_verified_at', [session.user_id, body.displayName == null ? null : requiredString(body.displayName, 'Display name', 120)]); ok(response, result.rows[0]); return;
  }
  if (method === 'GET' && pathname === '/api/account/bookings') { const session = await requireSession(request); const rows = await query(`SELECT b.reference,b.status,b.payment_status,b.check_in,b.check_out,b.adults,b.children,b.total_cents,b.currency,rt.name AS room_name FROM bookings b JOIN room_types rt ON rt.id=b.room_type_id WHERE b.user_id=$1 ORDER BY b.created_at DESC`, [session.user_id]); ok(response, rows.rows); return; }
  if (method === 'POST' && pathname.startsWith('/api/bookings/') && pathname.endsWith('/cancel')) {
    const session = await requireSession(request); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403);
    const reference = pathname.split('/')[3];
    const result = await withTransaction(async client => {
      const bookingResult = await client.query('SELECT * FROM bookings WHERE reference=$1 FOR UPDATE', [reference]);
      if (!bookingResult.rowCount || (bookingResult.rows[0].user_id !== session.user_id && !['super_admin','hotel_manager'].includes(session.role))) throw new DomainError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
      const booking = bookingResult.rows[0]; assertTransition(booking.status, 'cancelled');
      const arrival = new Date(`${booking.check_in}T12:00:00Z`); const daysUntil = Math.ceil((arrival - new Date()) / 86400000);
      if (daysUntil < Number(booking.cancellation_policy?.freeCancellationUntilDaysBefore ?? 7)) throw new DomainError('CANCELLATION_NOT_ALLOWED', 'This booking is inside the cancellation window.');
      const updated = await client.query("UPDATE bookings SET status='cancelled', updated_at=now() WHERE id=$1 RETURNING reference,status", [booking.id]);
      await client.query('INSERT INTO booking_events (booking_id,from_status,to_status,actor_user_id) VALUES ($1,$2,$3,$4)', [booking.id, booking.status, 'cancelled', session.user_id]);
      return updated.rows[0];
    });
    ok(response, result); return;
  }
  if (method === 'POST' && pathname === '/api/payments/demo/confirm') {
    const session = await requireSession(request); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403);
    const body = await readJson(request); const reference = requiredString(body.reference, 'Booking reference', 40);
    const result = await withTransaction(async client => {
      const bookingResult = await client.query('SELECT * FROM bookings WHERE reference=$1 FOR UPDATE', [reference]);
      if (!bookingResult.rowCount || bookingResult.rows[0].user_id !== session.user_id) throw new DomainError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
      const booking = bookingResult.rows[0];
      if (booking.payment_status === 'paid') return booking;
      if (!['awaiting_payment','held'].includes(booking.status)) throw new DomainError('PAYMENT_FAILED', 'This booking is not awaiting demo payment.');
      await client.query("UPDATE bookings SET status='confirmed', payment_status='paid', updated_at=now() WHERE id=$1", [booking.id]);
      const payment = await client.query("UPDATE payments SET status='paid', provider_reference=$2, updated_at=now() WHERE booking_id=$1 RETURNING *", [booking.id, `demo_${randomToken(10)}`]);
      await client.query('INSERT INTO booking_events (booking_id,from_status,to_status,actor_user_id,metadata) VALUES ($1,$2,$3,$4,$5)', [booking.id, booking.status, 'confirmed', session.user_id, JSON.stringify({ payment: 'demo' })]);
      return { ...booking, status: 'confirmed', payment_status: 'paid', payment: payment.rows[0] };
    });
    ok(response, { reference: result.reference, status: result.status, paymentStatus: result.payment_status, demo: true }); return;
  }
  if (method === 'POST' && pathname === '/api/payments/stripe/webhook') {
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new DomainError('PAYMENT_PROVIDER_NOT_CONFIGURED', 'Stripe webhooks are not configured in this environment.', 503);
    const rawBody = await readRaw(request); const signature = request.headers['stripe-signature'];
    if (!verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)) throw new DomainError('PAYMENT_WEBHOOK_INVALID', 'Stripe webhook signature could not be verified.', 400);
    const event = JSON.parse(rawBody); const inserted = await query('INSERT INTO payment_events (provider_event_id,event_type,payload) VALUES ($1,$2,$3) ON CONFLICT (provider_event_id) DO NOTHING RETURNING id', [event.id, event.type, event]);
    if (inserted.rowCount && event.type === 'checkout.session.completed' && event.data?.object?.metadata?.bookingReference) {
      await query("UPDATE bookings SET status='confirmed', payment_status='paid', updated_at=now() WHERE reference=$1", [event.data.object.metadata.bookingReference]);
    }
    ok(response, { received: true, duplicate: !inserted.rowCount }); return;
  }
  if (method === 'POST' && pathname === '/api/contact') { const body = await readJson(request); const result = await query('INSERT INTO contact_inquiries (name,email,topic,message) VALUES ($1,$2,$3,$4) RETURNING id,status', [requiredString(body.name, 'Name', 120), email(body.email), requiredString(body.topic, 'Topic', 120), requiredString(body.message, 'Message', 5000)]); ok(response, result.rows[0], 201); return; }
  if (method === 'POST' && pathname === '/api/newsletter') { const body = await readJson(request); const result = await query('INSERT INTO newsletter_subscriptions (email) VALUES ($1) ON CONFLICT (email) DO UPDATE SET unsubscribed_at=NULL RETURNING id,email', [email(body.email)]); ok(response, result.rows[0], 201); return; }
  if (method === 'GET' && pathname === '/api/spa/services') { const result = await query('SELECT * FROM spa_services WHERE is_active=true ORDER BY name'); ok(response, result.rows); return; }
  if (method === 'GET' && pathname === '/api/dining/venues') { const result = await query('SELECT * FROM dining_venues WHERE is_active=true ORDER BY name'); ok(response, result.rows); return; }
  if (method === 'GET' && pathname === '/api/experiences') { const result = await query('SELECT * FROM experiences WHERE is_active=true ORDER BY name'); ok(response, result.rows); return; }
  if (method === 'POST' && pathname === '/api/spa/appointments') {
    const session = await getSession(request); const body = await readJson(request);
    const service = body.serviceId ? await query('SELECT id,name FROM spa_services WHERE id=$1 AND is_active=true', [Number(body.serviceId)]) : await query('SELECT id,name FROM spa_services WHERE name=$1 AND is_active=true', [requiredString(body.serviceName, 'Service', 160)]);
    if (!service.rowCount) throw new DomainError('SERVICE_NOT_FOUND', 'That spa service is not available.', 404);
    const appointmentDate = requiredString(body.appointmentDate, 'Appointment date', 20); const appointmentTime = requiredString(body.appointmentTime, 'Appointment time', 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^\d{2}:\d{2}$/.test(appointmentTime) || new Date(`${appointmentDate}T${appointmentTime}:00Z`) < new Date()) throw new DomainError('INVALID_APPOINTMENT', 'Choose a future spa appointment date and time.');
    const result = await query(`INSERT INTO spa_appointments (user_id,service_id,appointment_date,appointment_time,guest_name,guest_email,notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,status`, [session?.user_id || null, service.rows[0].id, appointmentDate, appointmentTime, requiredString(body.guestName, 'Guest name', 160), email(body.guestEmail), String(body.notes || '').slice(0, 2000)]);
    ok(response, { ...result.rows[0], service: service.rows[0].name }, 201); return;
  }
  if (method === 'POST' && pathname === '/api/dining/reservations') {
    const session = await getSession(request); const body = await readJson(request);
    const venue = body.venueId ? await query('SELECT id,name FROM dining_venues WHERE id=$1 AND is_active=true', [Number(body.venueId)]) : await query('SELECT id,name FROM dining_venues WHERE name=$1 AND is_active=true', [requiredString(body.venueName, 'Venue', 160)]);
    if (!venue.rowCount) throw new DomainError('VENUE_NOT_FOUND', 'That dining venue is not available.', 404);
    const reservationDate = requiredString(body.reservationDate, 'Reservation date', 20); const reservationTime = requiredString(body.reservationTime, 'Reservation time', 10); const partySize = Number(body.partySize);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reservationDate) || !/^\d{2}:\d{2}$/.test(reservationTime) || new Date(`${reservationDate}T${reservationTime}:00Z`) < new Date() || !Number.isInteger(partySize) || partySize < 1 || partySize > 20) throw new DomainError('INVALID_DINING_RESERVATION', 'Choose a future date, a valid time and a party size from 1 to 20.');
    const result = await query(`INSERT INTO dining_reservations (user_id,venue_id,reservation_date,reservation_time,party_size,guest_name,guest_email) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,status`, [session?.user_id || null, venue.rows[0].id, reservationDate, reservationTime, partySize, requiredString(body.guestName, 'Guest name', 160), email(body.guestEmail)]);
    ok(response, { ...result.rows[0], venue: venue.rows[0].name }, 201); return;
  }
  if (method === 'POST' && pathname === '/api/experiences/bookings') {
    const session = await getSession(request); const body = await readJson(request);
    const experience = body.experienceId ? await query('SELECT id,name FROM experiences WHERE id=$1 AND is_active=true', [Number(body.experienceId)]) : await query('SELECT id,name FROM experiences WHERE slug=$1 AND is_active=true', [requiredString(body.experienceSlug, 'Experience', 120)]);
    if (!experience.rowCount) throw new DomainError('EXPERIENCE_NOT_FOUND', 'That experience is not available.', 404);
    const experienceDate = requiredString(body.experienceDate, 'Experience date', 20); const guestCount = Number(body.guestCount);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(experienceDate) || new Date(`${experienceDate}T12:00:00Z`) < new Date() || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) throw new DomainError('INVALID_EXPERIENCE_BOOKING', 'Choose a future date and a guest count from 1 to 20.');
    const result = await query(`INSERT INTO experience_bookings (user_id,experience_id,experience_date,guest_count,guest_name,guest_email) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,status`, [session?.user_id || null, experience.rows[0].id, experienceDate, guestCount, requiredString(body.guestName, 'Guest name', 160), email(body.guestEmail)]);
    ok(response, { ...result.rows[0], experience: experience.rows[0].name }, 201); return;
  }
  if (pathname.startsWith('/api/admin/')) {
    const session = await requireAdmin(request);
    if (method === 'GET' && pathname === '/api/admin/room-types') {
      const rows = await query(`SELECT rt.slug,rt.category,rt.name,rt.short_description,rt.description,rt.base_price_cents,rt.max_adults,rt.max_children,rt.area_m2,rt.bed_type,rt.is_active,COUNT(ru.id)::int AS unit_count
        FROM room_types rt LEFT JOIN room_units ru ON ru.room_type_id=rt.id GROUP BY rt.id ORDER BY rt.name`); ok(response, rows.rows); return;
    }
    if (method === 'POST' && pathname === '/api/admin/room-types') {
      requireRole(session, ['super_admin','hotel_manager','content_editor']); const body = await readJson(request);
      const result = await query(`INSERT INTO room_types (slug,category,name,short_description,description,base_price_cents,max_adults,max_children,area_m2,bed_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [requiredString(body.slug,'Slug',100), requiredString(body.category,'Category',20), requiredString(body.name,'Name',160), requiredString(body.shortDescription,'Short description',500), requiredString(body.description,'Description',5000), Number(body.basePriceCents), Number(body.maxAdults), Number(body.maxChildren || 0), Number(body.areaM2), requiredString(body.bedType,'Bed type',80)]); await query('INSERT INTO audit_logs (actor_user_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5)', [session.user_id,'room_type.create','room_type',result.rows[0].slug,JSON.stringify({ name: result.rows[0].name })]); ok(response, result.rows[0], 201); return;
    }
    if (method === 'PATCH' && pathname.startsWith('/api/admin/room-types/')) {
      requireRole(session, ['super_admin','hotel_manager','content_editor']); const slug = pathname.split('/').pop(); const body = await readJson(request); const result = await query(`UPDATE room_types SET name=COALESCE($2,name),short_description=COALESCE($3,short_description),description=COALESCE($4,description),base_price_cents=COALESCE($5,base_price_cents),is_active=COALESCE($6,is_active),updated_at=now() WHERE slug=$1 RETURNING *`, [slug, body.name, body.shortDescription, body.description, body.basePriceCents == null ? null : Number(body.basePriceCents), body.isActive == null ? null : Boolean(body.isActive)]); if (!result.rowCount) throw new DomainError('ROOM_NOT_FOUND','Room type not found.',404); await query('INSERT INTO audit_logs (actor_user_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5)', [session.user_id,'room_type.update','room_type',slug,JSON.stringify(body)]); ok(response, result.rows[0]); return;
    }
    if (method === 'POST' && pathname.startsWith('/api/admin/room-types/') && pathname.endsWith('/units')) {
      requireRole(session, ['super_admin','hotel_manager','front_desk']); const slug = pathname.split('/')[4]; const body = await readJson(request); const type = await query('SELECT id FROM room_types WHERE slug=$1', [slug]); if (!type.rowCount) throw new DomainError('ROOM_NOT_FOUND','Room type not found.',404); const result = await query('INSERT INTO room_units (room_type_id,code) VALUES ($1,$2) RETURNING *', [type.rows[0].id, requiredString(body.code,'Unit code',50)]); ok(response, result.rows[0], 201); return;
    }
    if (method === 'PATCH' && pathname.startsWith('/api/admin/room-units/')) {
      requireRole(session, ['super_admin','hotel_manager','front_desk','housekeeping']); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403); const code = pathname.split('/').pop(); const body = await readJson(request); const status = requiredString(body.status,'Status',30); if (!['available','occupied','maintenance','out_of_service'].includes(status)) throw new DomainError('VALIDATION_ERROR','Invalid room unit status.'); const result = await query('UPDATE room_units SET status=$2 WHERE code=$1 RETURNING *', [code, status]); if (!result.rowCount) throw new DomainError('ROOM_UNIT_NOT_FOUND','Physical room unit not found.',404); await query('INSERT INTO audit_logs (actor_user_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5)', [session.user_id,'room_unit.status.update','room_unit',code,JSON.stringify({ status })]); ok(response, result.rows[0]); return;
    }
    if (method === 'POST' && pathname.startsWith('/api/admin/room-units/') && pathname.endsWith('/maintenance')) {
      requireRole(session, ['super_admin','hotel_manager','housekeeping']); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403); const code = pathname.split('/')[4]; const body = await readJson(request); const unit = await query('SELECT id FROM room_units WHERE code=$1', [code]); if (!unit.rowCount) throw new DomainError('ROOM_UNIT_NOT_FOUND','Physical room unit not found.',404); const startsOn = requiredString(body.startsOn,'Start date',20); const endsOn = requiredString(body.endsOn,'End date',20); assertDateRange(startsOn, endsOn); const result = await query('INSERT INTO maintenance_blocks (room_unit_id,starts_on,ends_on,reason) VALUES ($1,$2,$3,$4) RETURNING *', [unit.rows[0].id, startsOn, endsOn, requiredString(body.reason,'Reason',500)]); await query("UPDATE room_units SET status='maintenance' WHERE id=$1", [unit.rows[0].id]); ok(response, result.rows[0], 201); return;
    }
    if (method === 'POST' && pathname.startsWith('/api/admin/seasonal-rates')) {
      requireRole(session, ['super_admin','hotel_manager']); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403); const body = await readJson(request); const room = await query('SELECT id FROM room_types WHERE slug=$1', [requiredString(body.roomSlug,'Room slug',100)]); if (!room.rowCount) throw new DomainError('ROOM_NOT_FOUND','Room type not found.',404); const startsOn = requiredString(body.startsOn,'Start date',20); const endsOn = requiredString(body.endsOn,'End date',20); assertDateRange(startsOn, endsOn); const rate = Number(body.nightlyPriceCents); if (!Number.isInteger(rate) || rate < 0) throw new DomainError('VALIDATION_ERROR','Nightly price must be a non-negative integer in cents.'); const overlap = await query('SELECT 1 FROM seasonal_rates WHERE room_type_id=$1 AND daterange(starts_on,ends_on,\'[)\') && daterange($2::date,$3::date,\'[)\') LIMIT 1', [room.rows[0].id, startsOn, endsOn]); if (overlap.rowCount) throw new DomainError('SEASONAL_RATE_CONFLICT','That seasonal rate overlaps an existing rate.',409); const plan = await query("SELECT id FROM rate_plans WHERE room_type_id=$1 AND slug='flexible'", [room.rows[0].id]); const result = await query('INSERT INTO seasonal_rates (room_type_id,rate_plan_id,starts_on,ends_on,nightly_price_cents) VALUES ($1,$2,$3,$4,$5) RETURNING *', [room.rows[0].id, plan.rows[0].id, startsOn, endsOn, rate]); ok(response, result.rows[0], 201); return;
    }
    if (method === 'PATCH' && pathname.startsWith('/api/admin/spa-appointments/')) {
      requireRole(session, ['super_admin','hotel_manager','front_desk','reservations_staff']); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403); const id = Number(pathname.split('/').pop()); const status = requiredString((await readJson(request)).status, 'Status', 30); if (!['requested','confirmed','declined','cancelled','completed'].includes(status)) throw new DomainError('VALIDATION_ERROR','Invalid spa appointment status.'); const result = await query('UPDATE spa_appointments SET status=$2 WHERE id=$1 RETURNING *', [id,status]); if (!result.rowCount) throw new DomainError('NOT_FOUND','Spa appointment not found.',404); ok(response,result.rows[0]); return;
    }
    if (method === 'PATCH' && pathname.startsWith('/api/admin/dining-reservations/')) {
      requireRole(session, ['super_admin','hotel_manager','front_desk','reservations_staff']); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403); const id = Number(pathname.split('/').pop()); const status = requiredString((await readJson(request)).status, 'Status', 30); if (!['requested','confirmed','declined','cancelled'].includes(status)) throw new DomainError('VALIDATION_ERROR','Invalid dining reservation status.'); const result = await query('UPDATE dining_reservations SET status=$2 WHERE id=$1 RETURNING *', [id,status]); if (!result.rowCount) throw new DomainError('NOT_FOUND','Dining reservation not found.',404); ok(response,result.rows[0]); return;
    }
    if (method === 'PATCH' && pathname.startsWith('/api/admin/experience-bookings/')) {
      requireRole(session, ['super_admin','hotel_manager','front_desk','reservations_staff']); if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403); const id = Number(pathname.split('/').pop()); const status = requiredString((await readJson(request)).status, 'Status', 30); if (!['requested','confirmed','declined','cancelled'].includes(status)) throw new DomainError('VALIDATION_ERROR','Invalid experience booking status.'); const result = await query('UPDATE experience_bookings SET status=$2 WHERE id=$1 RETURNING *', [id,status]); if (!result.rowCount) throw new DomainError('NOT_FOUND','Experience booking not found.',404); ok(response,result.rows[0]); return;
    }
    if (method === 'GET' && pathname === '/api/admin/inquiries') { requireRole(session, ['super_admin','hotel_manager','front_desk','content_editor']); const rows = await query('SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT 100'); ok(response, rows.rows); return; }
    if (method === 'GET' && pathname === '/api/admin/customers') { requireRole(session, ['super_admin','hotel_manager','front_desk','reservations_staff']); const rows = await query(`SELECT u.id,u.email,u.display_name,u.email_verified_at,u.created_at,COUNT(b.id)::int AS booking_count,COALESCE(SUM(b.total_cents) FILTER (WHERE b.status IN ('confirmed','checked_in','checked_out')),0)::int AS lifetime_value_cents FROM users u LEFT JOIN bookings b ON b.user_id=u.id WHERE u.role='customer' GROUP BY u.id ORDER BY u.created_at DESC LIMIT 250`); ok(response, rows.rows); return; }
    if (method === 'GET' && pathname === '/api/admin/reports') {
      requireRole(session, ['super_admin','hotel_manager']);
      const [monthly, roomMix, payments] = await Promise.all([
        query(`SELECT to_char(date_trunc('month',check_in),'YYYY-MM') AS month,COUNT(*)::int AS reservations,COALESCE(SUM(total_cents) FILTER (WHERE status IN ('confirmed','checked_in','checked_out')),0)::int AS revenue_cents FROM bookings WHERE check_in >= CURRENT_DATE - INTERVAL '12 months' GROUP BY 1 ORDER BY 1`),
        query(`SELECT rt.name,COUNT(b.id)::int AS bookings,COALESCE(SUM(b.total_cents) FILTER (WHERE b.status IN ('confirmed','checked_in','checked_out')),0)::int AS revenue_cents FROM room_types rt LEFT JOIN bookings b ON b.room_type_id=rt.id GROUP BY rt.id ORDER BY revenue_cents DESC`),
        query(`SELECT payment_status,COUNT(*)::int AS bookings,COALESCE(SUM(total_cents),0)::int AS total_cents FROM bookings GROUP BY payment_status ORDER BY payment_status`)
      ]);
      ok(response, { monthly: monthly.rows, roomMix: roomMix.rows, payments: payments.rows }); return;
    }
    if (method === 'GET' && pathname === '/api/admin/spa-appointments') { requireRole(session, ['super_admin','hotel_manager','front_desk','reservations_staff']); const rows = await query(`SELECT a.*,s.name AS service_name FROM spa_appointments a JOIN spa_services s ON s.id=a.service_id ORDER BY a.appointment_date,a.appointment_time LIMIT 250`); ok(response, rows.rows); return; }
    if (method === 'GET' && pathname === '/api/admin/dining-reservations') { requireRole(session, ['super_admin','hotel_manager','front_desk','reservations_staff']); const rows = await query(`SELECT r.*,v.name AS venue_name FROM dining_reservations r JOIN dining_venues v ON v.id=r.venue_id ORDER BY r.reservation_date,r.reservation_time LIMIT 250`); ok(response, rows.rows); return; }
    if (method === 'GET' && pathname === '/api/admin/experience-bookings') { requireRole(session, ['super_admin','hotel_manager','front_desk','reservations_staff']); const rows = await query(`SELECT b.*,e.name AS experience_name FROM experience_bookings b JOIN experiences e ON e.id=b.experience_id ORDER BY b.experience_date LIMIT 250`); ok(response, rows.rows); return; }
    if (method === 'GET' && pathname === '/api/admin/dashboard') {
      const [bookings, checkins, checkouts, units, revenue, outstanding, pending, arrivals, departures, activity] = await Promise.all([
        query("SELECT COUNT(*)::int AS count FROM bookings WHERE status <> 'cancelled'"),
        query("SELECT COUNT(*)::int AS count FROM bookings WHERE check_in=CURRENT_DATE AND status IN ('confirmed','checked_in')"),
        query("SELECT COUNT(*)::int AS count FROM bookings WHERE check_out=CURRENT_DATE AND status IN ('confirmed','checked_in')"),
        query("SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE status='available')::int AS available,COUNT(*) FILTER (WHERE status='occupied')::int AS occupied,COUNT(*) FILTER (WHERE status='maintenance')::int AS maintenance,COUNT(*) FILTER (WHERE status='out_of_service')::int AS out_of_service FROM room_units"),
        query("SELECT COALESCE(SUM(total_cents),0)::int AS cents FROM bookings WHERE status IN ('confirmed','checked_in','checked_out')"),
        query("SELECT COALESCE(SUM(total_cents),0)::int AS cents FROM bookings WHERE payment_status IN ('unpaid','pending') AND status IN ('held','awaiting_payment','confirmed','checked_in')"),
        query("SELECT COUNT(*)::int AS count FROM bookings WHERE status IN ('held','awaiting_payment')"),
        query("SELECT COUNT(*)::int AS count FROM bookings WHERE check_in BETWEEN CURRENT_DATE AND CURRENT_DATE + 30 AND status IN ('confirmed','awaiting_payment')"),
        query("SELECT COUNT(*)::int AS count FROM bookings WHERE check_out BETWEEN CURRENT_DATE AND CURRENT_DATE + 30 AND status IN ('confirmed','checked_in')"),
        query(`SELECT created_at,action,entity_type,entity_id,metadata FROM audit_logs ORDER BY created_at DESC LIMIT 10`)
      ]);
      const inventory = units.rows[0]; const occupancyRate = inventory.total ? Math.round((inventory.occupied / inventory.total) * 1000) / 10 : 0;
      ok(response, { totalBookings: bookings.rows[0].count, todayCheckIns: checkins.rows[0].count, todayCheckOuts: checkouts.rows[0].count, availableRooms: inventory.available, occupiedRooms: inventory.occupied, maintenanceRooms: inventory.maintenance, outOfServiceRooms: inventory.out_of_service, totalRooms: inventory.total, occupancyRate, revenueCents: revenue.rows[0].cents, outstandingPaymentsCents: outstanding.rows[0].cents, pendingReservations: pending.rows[0].count, upcomingArrivals: arrivals.rows[0].count, upcomingDepartures: departures.rows[0].count, recentActivity: activity.rows }); return;
    }
    if (method === 'GET' && pathname === '/api/admin/bookings') { const rows = await query(`SELECT b.reference,b.status,b.payment_status,b.check_in,b.check_out,b.total_cents,b.currency,b.guest_snapshot,rt.name AS room_name,ru.code AS room_unit FROM bookings b JOIN room_types rt ON rt.id=b.room_type_id LEFT JOIN room_units ru ON ru.id=b.room_unit_id ORDER BY b.created_at DESC LIMIT 100`); ok(response, rows.rows); return; }
    if (method === 'PATCH' && pathname.startsWith('/api/admin/bookings/')) {
      if (!requireCsrf(request, session)) throw new DomainError('CSRF_FAILED', 'A valid CSRF token is required.', 403);
      requireRole(session, ['super_admin','hotel_manager','front_desk','reservations_staff']);
      const reference = pathname.split('/').pop(); const body = await readJson(request); const nextStatus = body.status == null ? null : requiredString(body.status, 'Status', 30); const nextPaymentStatus = body.paymentStatus == null ? null : requiredString(body.paymentStatus, 'Payment status', 30);
      if (!nextStatus && !nextPaymentStatus) throw new DomainError('VALIDATION_ERROR', 'Status or payment status is required.');
      if (nextPaymentStatus && !['unpaid','pending','paid','failed','refunded','partially_refunded'].includes(nextPaymentStatus)) throw new DomainError('VALIDATION_ERROR', 'Invalid payment status.');
      const result = await withTransaction(async client => { const current = await client.query('SELECT * FROM bookings WHERE reference=$1 FOR UPDATE', [reference]); if (!current.rowCount) throw new DomainError('BOOKING_NOT_FOUND', 'Booking not found.', 404); if (nextStatus) assertTransition(current.rows[0].status, nextStatus); const updated = await client.query('UPDATE bookings SET status=COALESCE($2,status),payment_status=COALESCE($3,payment_status),updated_at=now() WHERE reference=$1 RETURNING reference,status,payment_status', [reference,nextStatus,nextPaymentStatus]); if (nextStatus) await client.query('INSERT INTO booking_events (booking_id,from_status,to_status,actor_user_id) VALUES ($1,$2,$3,$4)', [current.rows[0].id,current.rows[0].status,nextStatus,session.user_id]); await client.query('INSERT INTO audit_logs (actor_user_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,$3,$4,$5)', [session.user_id,'booking.update','booking',reference,JSON.stringify({ status: nextStatus, paymentStatus: nextPaymentStatus })]); return updated.rows[0]; });
      ok(response, result); return;
    }
  }
  throw new DomainError('NOT_FOUND', 'API route not found.', 404);
}

async function serveStatic(request, response, pathname) {
  let requested = pathname === '/' ? '/index.html' : pathname;
  if (!path.extname(requested)) requested = '/index.html';
  const filePath = path.resolve(distDir, `.${requested}`);
  if (!filePath.startsWith(distDir)) { response.writeHead(403); response.end('Forbidden'); return; }
  try {
    const content = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    const type = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[extension] || 'application/octet-stream';
    response.writeHead(200, { 'content-type': type, 'cache-control': extension === '.html' ? 'no-cache' : 'public, max-age=3600' }); response.end(content);
  } catch { response.writeHead(404); response.end('Not found'); }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(request, response, url.pathname, request.method);
    else await serveStatic(request, response, url.pathname);
  } catch (error) { fail(response, error); }
});

server.listen(port, () => console.log(`Elysian Retreat running at http://127.0.0.1:${port}`));

async function shutdown() { await pool.end(); server.close(() => process.exit(0)); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
