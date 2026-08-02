import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isLoggedIn } from '../../../../lib/auth';

const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const ALLOWED_VIDEO_EXT = ['mp4', 'webm', 'mov'];

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isLoggedIn())) {
          throw new Error('Not authorized');
        }
        const ext = (pathname.split('.').pop() || '').toLowerCase();
        const isImage =
          pathname.startsWith('uploads/gallery/') ||
          pathname.startsWith('uploads/achievements/') ||
          pathname.startsWith('uploads/site/');
        const isVideo = pathname.startsWith('uploads/videos/');
        if (isImage && !ALLOWED_IMAGE_EXT.includes(ext)) {
          throw new Error('या प्रकारच्या फाईलला परवानगी नाही.');
        }
        if (isVideo && !ALLOWED_VIDEO_EXT.includes(ext)) {
          throw new Error('या प्रकारच्या फाईलला परवानगी नाही.');
        }
        if (!isImage && !isVideo) {
          throw new Error('अवैध अपलोड मार्ग.');
        }
        return {
          allowedContentTypes: isImage
            ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            : ['video/mp4', 'video/webm', 'video/quicktime'],
          addRandomSuffix: true,
          maximumSizeInBytes: isImage ? 8 * 1024 * 1024 : 100 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // no-op: the client tells us the resulting URL directly afterward,
        // when it calls /api/admin/add-item to save the caption/category.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
