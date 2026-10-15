import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { query } from './db.js';

const scryptAsync = promisify(crypto.scrypt);
const COOKIE_NAME = 'elysian_session';
const SESSION_DAYS = 14;

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export async function hashPassword(password) {
  const salt = randomToken(16);
  const derived = await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${Buffer.from(derived).toString('base64url')}`;
}

export async function verifyPassword(password, stored) {
  const [algorithm, salt, encoded] = String(stored).split('$');
  if (algorithm !== 'scrypt' || !salt || !encoded) return false;
  const expected = Buffer.from(encoded, 'base64url');
  const actual = Buffer.from(await scryptAsync(password, salt, expected.length, { N: 16384, r: 8, p: 1 }));
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function parseCookies(request) {
  const header = request.headers.cookie || '';
  return Object.fromEntries(header.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function sessionCookie(token, maxAge = SESSION_DAYS * 86400) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

export function clearSessionCookie() {
  return [`${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`, 'elysian_csrf=; Max-Age=0; Path=/; SameSite=Lax'];
}

export function csrfCookie(token) {
  return `elysian_csrf=${encodeURIComponent(token)}; Max-Age=${SESSION_DAYS * 86400}; Path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId) {
  const token = randomToken(32);
  const csrf = randomToken(24);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await query('INSERT INTO sessions (user_id, token_hash, csrf_token_hash, expires_at) VALUES ($1,$2,$3,$4)', [userId, hashToken(token), hashToken(csrf), expiresAt]);
  return { token, csrf, expiresAt };
}

export async function getSession(request) {
  const token = parseCookies(request)[COOKIE_NAME];
  if (!token) return null;
  const result = await query(`SELECT s.id, s.user_id, s.csrf_token_hash, s.expires_at, u.email, u.display_name, u.role, u.is_active
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > now() AND u.is_active = true`, [hashToken(token)]);
  if (!result.rowCount) return null;
  await query('UPDATE sessions SET last_seen_at = now() WHERE id = $1', [result.rows[0].id]);
  return { ...result.rows[0], token };
}

export function requireCsrf(request, session) {
  if (!session) return false;
  const supplied = request.headers['x-csrf-token'];
  return Boolean(supplied) && hashToken(supplied) === session.csrf_token_hash;
}

export { COOKIE_NAME };
