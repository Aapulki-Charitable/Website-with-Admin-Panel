import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getConfig, saveConfig } from './blob';

const COOKIE_NAME = 'aapulki_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'Missing SESSION_SECRET environment variable. Set it in your Vercel project settings.'
    );
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createSessionToken() {
  const payload = JSON.stringify({ ok: true, exp: Date.now() + SESSION_TTL_SECONDS * 1000 });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [b64, sig] = token.split('.');
  const expectedSig = sign(b64);
  if (!sig || sig.length !== expectedSig.length) return false;
  const validSig = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  if (!validSig) return false;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    return payload.ok === true && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function getCookieName() {
  return COOKIE_NAME;
}

export async function isLoggedIn() {
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Config document shape: { username, passwordHash }
 * Seeded on first use from env vars ADMIN_USERNAME / ADMIN_DEFAULT_PASSWORD
 * so the site works immediately after first deploy, before anyone has
 * changed the password from the dashboard.
 */
export async function getAdminConfig() {
  let config = await getConfig();
  if (!config) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Aapulki@2026';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    config = { username, passwordHash };
    await saveConfig(config);
  }
  return config;
}

export async function verifyCredentials(username, password) {
  const config = await getAdminConfig();
  const usernameOk =
    typeof username === 'string' &&
    username.length === config.username.length &&
    crypto.timingSafeEqual(Buffer.from(username), Buffer.from(config.username));
  if (!usernameOk) return false;
  return bcrypt.compare(password, config.passwordHash);
}

export async function changePassword(currentPassword, newPassword) {
  const config = await getAdminConfig();
  const ok = await bcrypt.compare(currentPassword, config.passwordHash);
  if (!ok) return { ok: false, error: 'सध्याचा पासवर्ड चुकीचा आहे.' };
  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: 'नवीन पासवर्ड किमान ८ अक्षरांचा असावा.' };
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await saveConfig({ ...config, passwordHash });
  return { ok: true };
}
