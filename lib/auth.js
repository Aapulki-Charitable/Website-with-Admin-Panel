import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getConfig, saveConfig } from './blob';

const COOKIE_NAME = 'aapulki_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const FALLBACK_SECRET = 'aapulki-charitable-trust-session-secret-key-9495e45db2b055f19b1c16ad48a2ef1c';

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    return FALLBACK_SECRET;
  }
  return secret.trim();
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
  try {
    if (!token || typeof token !== 'string' || !token.includes('.')) return false;
    const [b64, sig] = token.split('.');
    if (!b64 || !sig) return false;
    const expectedSig = sign(b64);
    if (!expectedSig || sig.length !== expectedSig.length) return false;
    const validSig = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
    if (!validSig) return false;
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    return payload.ok === true && payload.exp > Date.now();
  } catch (err) {
    return false;
  }
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function getCookieName() {
  return COOKIE_NAME;
}

export async function isLoggedIn() {
  try {
    const store = cookies();
    const token = store.get(COOKIE_NAME)?.value;
    return verifySessionToken(token);
  } catch (err) {
    console.error('isLoggedIn error:', err);
    return false;
  }
}

/**
 * Config document shape: { username, passwordHash }
 * Seeded on first use from env vars ADMIN_USERNAME / ADMIN_DEFAULT_PASSWORD
 * so the site works immediately after first deploy, before anyone has
 * changed the password from the dashboard.
 */
export async function getAdminConfig() {
  try {
    let config = await getConfig();
    if (!config) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Aapulki@2026';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      config = { username, passwordHash };
      try {
        await saveConfig(config);
      } catch (saveErr) {
        console.warn('Could not persist admin config to storage, using in-memory config:', saveErr);
      }
    }
    return config;
  } catch (err) {
    console.error('getAdminConfig error:', err);
    const username = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Aapulki@2026';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    return { username, passwordHash };
  }
}

export async function verifyCredentials(username, password) {
  try {
    const config = await getAdminConfig();
    const usernameOk =
      typeof username === 'string' &&
      username.length === config.username.length &&
      crypto.timingSafeEqual(Buffer.from(username), Buffer.from(config.username));
    if (!usernameOk) return false;
    return bcrypt.compare(password, config.passwordHash);
  } catch (err) {
    console.error('verifyCredentials error:', err);
    return false;
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const config = await getAdminConfig();
    const ok = await bcrypt.compare(currentPassword, config.passwordHash);
    if (!ok) return { ok: false, error: 'सध्याचा पासवर्ड चुकीचा आहे.' };
    if (!newPassword || newPassword.length < 8) {
      return { ok: false, error: 'नवीन पासवर्ड किमान ८ अक्षरांचा असावा.' };
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await saveConfig({ ...config, passwordHash });
    return { ok: true };
  } catch (err) {
    console.error('changePassword error:', err);
    return { ok: false, error: 'पासवर्ड बदलताना त्रुटी आली.' };
  }
}
