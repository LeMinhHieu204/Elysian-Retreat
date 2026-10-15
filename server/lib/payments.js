import crypto from 'node:crypto';

export function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!secret || !signatureHeader) return false;
  const values = Object.fromEntries(signatureHeader.split(',').map(part => part.split('=')));
  if (!values.t || !values.v1) return false;
  const age = Math.abs(Date.now() / 1000 - Number(values.t));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${values.t}.${rawBody}`).digest('hex');
  const actual = Buffer.from(values.v1, 'hex');
  const signed = Buffer.from(expected, 'hex');
  return actual.length === signed.length && crypto.timingSafeEqual(actual, signed);
}

export function providerStatus() {
  return { demo: true, payAtProperty: true, stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) };
}
