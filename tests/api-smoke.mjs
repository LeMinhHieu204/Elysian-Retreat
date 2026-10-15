import assert from 'node:assert/strict';

const baseUrl = process.env.TEST_BASE_URL || 'http://127.0.0.1:4174';
const email = `qa-${Date.now()}@example.test`;
const password = 'LocalTestPassword-2026!';
const testYear = 2100 + Math.floor(Math.random() * 200);
const checkIn = `${testYear}-08-10`;
const checkOut = `${testYear}-08-12`;
const holdCheckIn = `${testYear}-09-01`;
const holdCheckOut = `${testYear}-09-03`;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
  const json = await response.json();
  return { response, json };
}

function cookies(response) {
  return (response.headers.getSetCookie?.() || []).map(value => value.split(';')[0]).join('; ');
}

const health = await request('/api/health');
assert.equal(health.response.status, 200);
assert.equal(health.json.data.database, 'connected');

const rooms = await request('/api/rooms');
assert.equal(rooms.response.status, 200);
assert.equal(rooms.json.data.length >= 8, true);

const quote = await request('/api/availability/quote', { method: 'POST', body: JSON.stringify({ roomSlug: 'infinity-suite', checkIn, checkOut, adults: 2, children: 0 }) });
assert.equal(quote.response.status, 200);
assert.equal(quote.json.data.available, true);
assert.equal(quote.json.data.nights, 2);
assert.equal(quote.json.data.quote.totalCents > quote.json.data.quote.subtotalCents, true);

const hold = await request('/api/bookings/hold', { method: 'POST', body: JSON.stringify({ roomSlug: 'deluxe-sea-view-room', checkIn: holdCheckIn, checkOut: holdCheckOut, adults: 2, children: 0 }) });
assert.equal(hold.response.status, 201);
assert.ok(hold.json.data.holdToken);
const released = await request(`/api/bookings/hold/${hold.json.data.holdToken}/release`, { method: 'POST' });
assert.equal(released.response.status, 200);

const services = await request('/api/spa/services');
assert.equal(services.response.status, 200);
assert.equal(services.json.data.length >= 1, true);
const spaRequest = await request('/api/spa/appointments', { method: 'POST', body: JSON.stringify({ serviceName: services.json.data[0].name, appointmentDate: `${testYear}-09-05`, appointmentTime: '10:00', guestName: 'QA Spa Guest', guestEmail: `spa-${Date.now()}@example.test` }) });
assert.equal(spaRequest.response.status, 201);
const diningVenues = await request('/api/dining/venues');
const diningRequest = await request('/api/dining/reservations', { method: 'POST', body: JSON.stringify({ venueName: diningVenues.json.data[0].name, reservationDate: `${testYear}-09-06`, reservationTime: '19:30', partySize: 2, guestName: 'QA Dining Guest', guestEmail: `dining-${Date.now()}@example.test` }) });
assert.equal(diningRequest.response.status, 201);
const experiences = await request('/api/experiences');
const experienceRequest = await request('/api/experiences/bookings', { method: 'POST', body: JSON.stringify({ experienceSlug: experiences.json.data[0].slug, experienceDate: `${testYear}-09-07`, guestCount: 2, guestName: 'QA Experience Guest', guestEmail: `experience-${Date.now()}@example.test` }) });
assert.equal(experienceRequest.response.status, 201);

const register = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName: 'QA Guest' }) });
assert.equal(register.response.status, 201);
const cookieHeader = cookies(register.response);
assert.ok(cookieHeader.includes('elysian_session='));
assert.ok(register.json.data.csrfToken);

const me = await request('/api/auth/me', { headers: { cookie: cookieHeader } });
assert.equal(me.json.data.user.email, email);

const bookingPayload = { roomSlug: 'infinity-suite', checkIn, checkOut, adults: 2, children: 0, paymentMethod: 'pay_at_property', guest: { name: 'QA Guest', email, phone: '+30 000' } };
const booking = await request('/api/bookings', { method: 'POST', headers: { cookie: cookieHeader }, body: JSON.stringify(bookingPayload) });
assert.equal(booking.response.status, 201);
assert.equal(booking.json.data.paymentStatus, 'unpaid');

const account = await request('/api/account/bookings', { headers: { cookie: cookieHeader } });
assert.equal(account.response.status, 200);
assert.equal(account.json.data.some(item => item.reference === booking.json.data.reference), true);

const demoBooking = await request('/api/bookings', { method: 'POST', body: JSON.stringify({ roomSlug: 'deluxe-sea-view-room', checkIn: holdCheckIn, checkOut: holdCheckOut, adults: 2, children: 0, paymentMethod: 'demo', guest: { name: 'QA Demo Guest', email: `demo-${Date.now()}@example.test` } }) });
assert.equal(demoBooking.response.status, 201);
assert.equal(demoBooking.json.data.status, 'confirmed');
assert.equal(demoBooking.json.data.paymentStatus, 'paid');

const idempotencyKey = `qa-idempotency-${Date.now()}`;
const idempotentPayload = { roomSlug: 'garden-terrace-suite', checkIn: `${testYear}-10-01`, checkOut: `${testYear}-10-03`, adults: 2, children: 0, paymentMethod: 'pay_at_property', idempotencyKey, guest: { name: 'QA Idempotent Guest', email: `idempotent-${Date.now()}@example.test` } };
const firstIdempotent = await request('/api/bookings', { method: 'POST', body: JSON.stringify(idempotentPayload) });
const secondIdempotent = await request('/api/bookings', { method: 'POST', body: JSON.stringify(idempotentPayload) });
assert.equal(firstIdempotent.response.status, 201);
assert.equal(secondIdempotent.response.status, 201);
assert.equal(secondIdempotent.json.data.reference, firstIdempotent.json.data.reference);

const concurrent = await Promise.all(Array.from({ length: 4 }, (_, index) => request('/api/bookings', { method: 'POST', body: JSON.stringify({ ...bookingPayload, guest: { name: `Concurrent Guest ${index}`, email: `concurrent-${Date.now()}-${index}@example.test` } }) })));
const concurrentSuccesses = concurrent.filter(item => item.response.status === 201);
const concurrentFailures = concurrent.filter(item => item.response.status === 409);
assert.equal(concurrentSuccesses.length <= 2, true);
assert.equal(concurrentFailures.length >= 2, true);

if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  const adminLogin = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) });
  assert.equal(adminLogin.response.status, 200);
  const adminCookie = cookies(adminLogin.response);
  const adminDashboard = await request('/api/admin/dashboard', { headers: { cookie: adminCookie } });
  assert.equal(adminDashboard.response.status, 200);
  assert.equal(typeof adminDashboard.json.data.totalBookings, 'number');
  const adminRooms = await request('/api/admin/room-types', { headers: { cookie: adminCookie } });
  assert.equal(adminRooms.response.status, 200);
  assert.equal(adminRooms.json.data.length >= 8, true);
  assert.equal(typeof adminDashboard.json.data.occupancyRate, 'number');
  assert.equal(typeof adminDashboard.json.data.outstandingPaymentsCents, 'number');
  const adminReports = await request('/api/admin/reports', { headers: { cookie: adminCookie } });
  assert.equal(adminReports.response.status, 200);
}

console.log(JSON.stringify({ health: 'connected', rooms: rooms.json.data.length, booking: booking.json.data.reference, concurrentSuccesses: concurrentSuccesses.length, concurrentFailures: concurrentFailures.length, admin: Boolean(process.env.ADMIN_EMAIL) }));
