import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { isLoggedIn } from '../../../../lib/auth';

function getCredentials() {
  let cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    'xs8qoehu'
  ).trim();
  let apiKey = (
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
    ''
  ).trim();
  let apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  // Also support CLOUDINARY_URL if provided
  if ((!apiKey || !apiSecret) && process.env.CLOUDINARY_URL) {
    const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      apiKey = match[1].trim();
      apiSecret = match[2].trim();
      cloudName = match[3].trim();
    }
  }

  return { cloudName, apiKey, apiSecret };
}

export async function POST(request) {
  try {
    if (!(await isLoggedIn())) {
      return NextResponse.json({ error: 'लॉगिन आवश्यक आहे (Not authorized).' }, { status: 401 });
    }

    const { cloudName, apiKey, apiSecret } = getCredentials();

    const missing = [];
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Vercel मध्ये या variables ची व्हॅल्यू रिकामी आहे किंवा सेट केलेली नाही: ${missing.join(', ')}. कृपया Vercel Settings -> Environment Variables तपासा.`,
        },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const body = await request.json().catch(() => ({}));
    const folder = body?.folder || 'aapulki/gallery';
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    console.error('Cloudinary sign error:', error);
    return NextResponse.json(
      { error: error.message || 'स्वाक्षरी तयार करता आली नाही.' },
      { status: 500 }
    );
  }
}
