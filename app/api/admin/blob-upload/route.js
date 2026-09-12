import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true, message: 'Uploads are handled directly via Cloudinary.' });
}
