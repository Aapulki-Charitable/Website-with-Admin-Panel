import { NextResponse } from 'next/server';
import { isLoggedIn, changePassword } from '../../../../lib/auth';
import {
  getGallery,
  saveGallery,
  getVideos,
  saveVideos,
  getAchievements,
  saveAchievements,
  getContent,
  saveContent,
  deleteFileIfOwned,
} from '../../../../lib/blob';

const CATEGORIES = ['shikshan', 'arogya', 'samaj'];

function redirectWithFlash(origin, tab, message, type) {
  const url = new URL('/admin/dashboard', origin);
  url.searchParams.set('tab', tab);
  url.searchParams.set('flash', message);
  url.searchParams.set('flashType', type);
  return NextResponse.redirect(url, 303);
}

export async function POST(request) {
  if (!(await isLoggedIn())) {
    return NextResponse.redirect(new URL('/admin/login', request.url), 303);
  }

  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const action = String(formData.get('action') || '');
  const tab = String(formData.get('tab') || 'shikshan');

  try {
    switch (action) {
      case 'edit_image': {
        const id = String(formData.get('id') || '');
        const caption = String(formData.get('caption') || '').trim();
        const category = String(formData.get('category') || '');

        const gallery = await getGallery();
        const item = gallery.find((g) => g.id === id);
        if (!item) return redirectWithFlash(origin, tab, 'फोटो सापडला नाही.', 'error');
        item.caption = caption;
        if (CATEGORIES.includes(category)) item.category = category;
        await saveGallery(gallery);

        return redirectWithFlash(origin, tab, 'फोटोची माहिती अपडेट झाली.', 'ok');
      }

      case 'delete_image': {
        const id = String(formData.get('id') || '');
        const gallery = await getGallery();
        const item = gallery.find((g) => g.id === id);
        if (!item) return redirectWithFlash(origin, tab, 'फोटो सापडला नाही.', 'error');

        await deleteFileIfOwned(item.image);
        await saveGallery(gallery.filter((g) => g.id !== id));

        return redirectWithFlash(origin, tab, 'फोटो काढून टाकला.', 'ok');
      }

      case 'edit_video': {
        const id = String(formData.get('id') || '');
        const caption = String(formData.get('caption') || '').trim();
        const videos = await getVideos();
        const item = videos.find((v) => v.id === id);
        if (!item) return redirectWithFlash(origin, tab, 'व्हिडिओ सापडला नाही.', 'error');
        item.caption = caption;
        await saveVideos(videos);

        return redirectWithFlash(origin, tab, 'व्हिडिओची माहिती अपडेट झाली.', 'ok');
      }

      case 'delete_video': {
        const id = String(formData.get('id') || '');
        const videos = await getVideos();
        const item = videos.find((v) => v.id === id);
        if (!item) return redirectWithFlash(origin, tab, 'व्हिडिओ सापडला नाही.', 'error');

        await deleteFileIfOwned(item.video);
        await saveVideos(videos.filter((v) => v.id !== id));

        return redirectWithFlash(origin, tab, 'व्हिडिओ काढून टाकला.', 'ok');
      }

      case 'edit_achievement': {
        const id = String(formData.get('id') || '');
        const tag = String(formData.get('tag') || '').trim();
        const title = String(formData.get('title') || formData.get('caption') || '').trim();
        const description = String(formData.get('description') || '').trim();

        const achievements = await getAchievements();
        const item = achievements.find((a) => a.id === id);
        if (!item) return redirectWithFlash(origin, tab, 'नोंद सापडली नाही.', 'error');
        item.tag = tag;
        item.title = title;
        item.caption = title;
        item.description = description;
        await saveAchievements(achievements);

        return redirectWithFlash(origin, tab, 'माहिती अपडेट झाली.', 'ok');
      }

      case 'delete_achievement': {
        const id = String(formData.get('id') || '');
        const achievements = await getAchievements();
        const item = achievements.find((a) => a.id === id);
        if (!item) return redirectWithFlash(origin, tab, 'नोंद सापडली नाही.', 'error');

        await deleteFileIfOwned(item.image);
        await saveAchievements(achievements.filter((a) => a.id !== id));

        return redirectWithFlash(origin, tab, 'नोंद काढून टाकली.', 'ok');
      }

      case 'update_points': {
        const category = String(formData.get('category') || '');
        if (!CATEGORIES.includes(category)) {
          return redirectWithFlash(origin, tab, 'अवैध प्रकार.', 'error');
        }
        const raw = String(formData.get('points') || '');
        const points = raw
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean);

        const content = await getContent();
        content.points = { ...content.points, [category]: points };
        await saveContent(content);

        return redirectWithFlash(origin, tab, 'यादी अपडेट झाली.', 'ok');
      }

      case 'update_about_text': {
        const name = String(formData.get('aboutImageName') || '').trim();
        const role = String(formData.get('aboutImageRole') || '').trim();

        const content = await getContent();
        content.aboutImageName = name;
        content.aboutImageRole = role;
        await saveContent(content);

        return redirectWithFlash(origin, tab, 'माहिती अपडेट झाली.', 'ok');
      }

      case 'update_marquee': {
        const marqueeText = String(formData.get('marqueeText') || '').trim();
        const content = await getContent();
        content.marqueeText = marqueeText;
        await saveContent(content);

        return redirectWithFlash(
          origin,
          'content',
          marqueeText ? 'सूचना पट्टी अपडेट झाली.' : 'सूचना पट्टी बंद करण्यात आली.',
          'ok'
        );
      }

      case 'change_password': {
        const current = String(formData.get('current_password') || '');
        const next = String(formData.get('new_password') || '');
        const confirm = String(formData.get('confirm_password') || '');

        if (next !== confirm) {
          return redirectWithFlash(origin, 'account', 'नवीन पासवर्ड जुळत नाहीत.', 'error');
        }
        const result = await changePassword(current, next);
        if (!result.ok) {
          return redirectWithFlash(origin, 'account', result.error, 'error');
        }
        return redirectWithFlash(origin, 'account', 'पासवर्ड यशस्वीरित्या बदलला गेला.', 'ok');
      }

      default:
        return redirectWithFlash(origin, tab, 'अवैध कृती.', 'error');
    }
  } catch (err) {
    console.error('admin action error', err);
    return redirectWithFlash(origin, tab, 'काहीतरी चूक झाली. पुन्हा प्रयत्न करा.', 'error');
  }
}
