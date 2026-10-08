import { NextResponse } from 'next/server';
import { isLoggedIn } from '../../../../lib/auth';
import {
  getGallery,
  saveGallery,
  getVideos,
  saveVideos,
  getAchievements,
  saveAchievements,
  getCampaigns,
  saveCampaigns,
  normalizeFormLink,
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
    const { tag, title, description } = data;
    const finalTitle = (title || caption || '').trim();
    const achievements = await getAchievements();
    achievements.push({
      id: newId('ac'),
      image: url,
      tag: (tag || '').trim(),
      title: finalTitle,
      caption: finalTitle,
      description: (description || '').trim(),
    });
    await saveAchievements(achievements);
    return NextResponse.json({ ok: true });
  }

  if (type === 'campaign') {
    if (!url) {
      return NextResponse.json({ error: 'मोहिमेसाठी फोटो आवश्यक आहे.' }, { status: 400 });
    }
    const formLink = normalizeFormLink(data.formLink);
    if (formLink === null) {
      return NextResponse.json(
        { error: 'फॉर्म लिंक https:// ने सुरू होणारी वैध लिंक असावी.' },
        { status: 400 }
      );
    }
    const campaigns = await getCampaigns();
    campaigns.push({
      id: newId('cp'),
      image: url,
      socialCaption: String(data.socialCaption || '').trim(),
      websiteText: String(data.websiteText || '').trim(),
      formLink,
      postWebsite: Boolean(data.postWebsite),
      createdAt: new Date().toISOString(),
    });
    await saveCampaigns(campaigns);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'अवैध विनंती.' }, { status: 400 });
}
