import { NextResponse } from 'next/server';
import { getCookieName } from '../../../../lib/auth';

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const res = NextResponse.redirect(`${origin}/admin/login`, 303);
  res.cookies.set({ name: getCookieName(), value: '', maxAge: 0, path: '/' });
  return res;
}

export async function GET(request) {
  return POST(request);
}
