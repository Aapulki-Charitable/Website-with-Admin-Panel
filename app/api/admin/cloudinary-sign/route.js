import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { isLoggedIn } from '../../../../lib/auth';

export async function POST(request) {
  try {
    if (!(await isLoggedIn())) {
      return NextResponse.json({ error: 'लॉगिन आवश्यक आहे (Not authorized).' }, { status: 401 });
    }

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary कॉन्फिगर केलेले नाही (Missing Cloudinary credentials).' },
        { status: 500 }
      );
    }

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

