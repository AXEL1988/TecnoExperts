import { createHash, randomBytes, timingSafeEqual, scryptSync } from 'node:crypto';
import { db } from './db';

const SESSION_DAYS = Number(process.env.SESSION_DAYS ?? 7);

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function verifyPassword(username: string, password: string) {
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ? AND is_active = 1').get(username);
  if (!user) return null;
  const derived = scryptSync(password, user.password_salt, 64).toString('hex');
  const ok = timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(user.password_hash, 'hex'));
  return ok ? { id: user.id, username: user.username } : null;
}

export function createSession(userId: number) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = sha256(token);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString().slice(0, 19).replace('T', ' ');
  db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP').run();
  db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)').run(userId, tokenHash, expires);
  return { token, expires };
}

export function getUserFromToken(token?: string) {
  if (!token) return null;
  const tokenHash = sha256(token);
  const row = db.prepare(`
    SELECT u.id, u.username
    FROM sessions s
    INNER JOIN admin_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1
  `).get(tokenHash);
  return row ?? null;
}

export function revokeSession(token?: string) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}
