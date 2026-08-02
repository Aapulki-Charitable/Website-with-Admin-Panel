import { NextResponse } from 'next/server';
import { isLoggedIn } from '../../../../lib/auth';
import {
  getGallery,
  saveGallery,
  getVideos,
  saveVideos,
  getAchievements,
  saveAchievements,
  newId,
} from '../../../../lib/blob';

const CATEGORIES = ['shikshan', 'arogya', 'samaj'];

export async function POST(request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: 'लॉगिन आवश्यक आहे.' }, { status: 401 });
  }

  const data = await request.json();
  const { type, url, caption, category } = data;

  if (type === 'image') {
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'अवैध प्रकार निवडला आहे.' }, { status: 400 });
    }
    const gallery = await getGallery();
    gallery.push({ id: newId('g'), category, image: url, caption: (caption || '').trim() });
    await saveGallery(gallery);
    return NextResponse.json({ ok: true });
  }

  if (type === 'video') {
    const videos = await getVideos();
    videos.push({ id: newId('v'), video: url, caption: (caption || '').trim() });
    await saveVideos(videos);
    return NextResponse.json({ ok: true });
  }

  if (type === 'achievement') {
    const achievements = await getAchievements();
    achievements.push({ id: newId('ac'), image: url, caption: (caption || '').trim() });
    await saveAchievements(achievements);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'अवैध विनंती.' }, { status: 400 });
}
