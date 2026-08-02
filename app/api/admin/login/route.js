import { NextResponse } from 'next/server';
import { verifyCredentials, createSessionToken, getSessionCookieOptions } from '../../../../lib/auth';

// Simple in-memory throttle. Note: on serverless this resets per cold start,
// so it's a soft speed-bump rather than a hard guarantee — good enough for
// a small nonprofit site, not a substitute for a real WAF.
const attempts = new Map();

function isLocked(ip) {
  const rec = attempts.get(ip);
  return rec && rec.lockedUntil && rec.lockedUntil > Date.now();
}

function recordFailure(ip) {
  const rec = attempts.get(ip) || { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= 5) {
    rec.lockedUntil = Date.now() + 5 * 60 * 1000;
    rec.count = 0;
  }
  attempts.set(ip, rec);
}

function recordSuccess(ip) {
  attempts.delete(ip);
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const origin = new URL(request.url).origin;

  if (isLocked(ip)) {
    return NextResponse.redirect(`${origin}/admin/login?locked=1`, 303);
  }

  const formData = await request.formData();
  const username = String(formData.get('username') || '');
  const password = String(formData.get('password') || '');

  const ok = await verifyCredentials(username, password);
  if (!ok) {
    recordFailure(ip);
    return NextResponse.redirect(`${origin}/admin/login?error=1`, 303);
  }

  recordSuccess(ip);
  const token = createSessionToken();
  const res = NextResponse.redirect(`${origin}/admin/dashboard`, 303);
  res.cookies.set({ ...getSessionCookieOptions(), value: token });
  return res;
}
