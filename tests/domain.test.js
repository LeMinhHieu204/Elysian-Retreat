import test from 'node:test';
import assert from 'node:assert/strict';
import { assertDateRange, assertOccupancy, calculateQuote, DomainError, assertTransition } from '../server/lib/domain.js';

test('date ranges return the exact number of stay nights', () => {
  assert.equal(assertDateRange('2099-05-10', '2099-05-14'), 4);
});

test('invalid and reversed date ranges are rejected', () => {
  assert.throws(() => assertDateRange('2099-05-14', '2099-05-10'), error => error instanceof DomainError && error.code === 'INVALID_DATE_RANGE');
});

test('occupancy is checked against room type capacity', () => {
  const room = { max_adults: 2, max_children: 1 };
  assert.deepEqual(assertOccupancy(room, 2, 1), { adults: 2, children: 1 });
  assert.throws(() => assertOccupancy(room, 3, 0), error => error.code === 'CAPACITY_EXCEEDED');
});

test('pricing calculates discounts, tax, service fee and total in integer cents', () => {
  const quote = calculateQuote({}, 2, [{ price_cents: 10000 }, { price_cents: 10000 }], 'WELCOME10');
  assert.deepEqual(quote, { currency: 'EUR', subtotalCents: 20000, discountCents: 2000, taxCents: 2160, serviceFeeCents: 900, totalCents: 21060, nightlyRates: [{ price_cents: 10000 }, { price_cents: 10000 }] });
});

test('booking lifecycle only allows declared transitions', () => {
  assert.doesNotThrow(() => assertTransition('confirmed', 'checked_in'));
  assert.throws(() => assertTransition('cancelled', 'confirmed'), error => error.code === 'INVALID_BOOKING_TRANSITION');
});
