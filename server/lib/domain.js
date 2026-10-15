export class DomainError extends Error {
  constructor(code, message, status = 400, details = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function assertDateRange(checkIn, checkOut) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn || '') || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut || '')) {
    throw new DomainError('INVALID_DATE_RANGE', 'Check-in and check-out must be valid dates.');
  }
  const start = new Date(`${checkIn}T12:00:00Z`);
  const end = new Date(`${checkOut}T12:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (start < today || end <= start) throw new DomainError('INVALID_DATE_RANGE', 'Choose a future check-in and a later check-out.');
  return Math.round((end - start) / 86400000);
}

export function assertOccupancy(room, adults, children) {
  const adultCount = Number(adults);
  const childCount = Number(children || 0);
  if (!Number.isInteger(adultCount) || adultCount < 1 || adultCount > room.max_adults || !Number.isInteger(childCount) || childCount < 0 || childCount > room.max_children) {
    throw new DomainError('CAPACITY_EXCEEDED', `This stay accommodates up to ${room.max_adults} adults and ${room.max_children} children.`);
  }
  return { adults: adultCount, children: childCount };
}

export function calculateQuote(room, nights, nightlyRates, promoCode = '') {
  const subtotalCents = nightlyRates.reduce((sum, rate) => sum + rate.price_cents, 0);
  const discountCents = String(promoCode).trim().toUpperCase() === 'WELCOME10' ? Math.round(subtotalCents * 0.1) : 0;
  const taxable = subtotalCents - discountCents;
  const taxCents = Math.round(taxable * 0.12);
  const serviceFeeCents = Math.round(taxable * 0.05);
  return { currency: 'EUR', subtotalCents, discountCents, taxCents, serviceFeeCents, totalCents: taxable + taxCents + serviceFeeCents, nightlyRates };
}

export function bookingReference() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ELY-${new Date().getFullYear()}-${part}`;
}

export const activeBookingStatuses = ['held', 'awaiting_payment', 'confirmed', 'checked_in'];
export const transitions = {
  held: ['awaiting_payment', 'confirmed', 'expired', 'cancelled'],
  awaiting_payment: ['confirmed', 'expired', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['checked_out'],
  checked_out: [],
  cancelled: [],
  expired: [],
  no_show: []
};

export function assertTransition(from, to) {
  if (!transitions[from]?.includes(to)) throw new DomainError('INVALID_BOOKING_TRANSITION', `Cannot move a booking from ${from} to ${to}.`);
}
