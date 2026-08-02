import { put, list, del } from '@vercel/blob';

const GALLERY_PATH = 'data/gallery.json';
const VIDEOS_PATH = 'data/videos.json';
const CONFIG_PATH = 'data/config.json';
const CONTENT_PATH = 'data/content.json';
const ACHIEVEMENTS_PATH = 'data/achievements.json';

const DEFAULT_CONTENT = {
  aboutImage: 'assets/253 donors.png',
  aboutImageName: 'मा. श्री. प्रशांत लहू देसाई',
  aboutImageRole: 'अध्यक्ष, आपुलकी चॅरिटेबल ट्रस्ट',
  karyakarteImage: 'assets/amche karyakarte.jpg',
  points: {
    shikshan: [
      '२२ जून २०२५ - शालेय वस्तू आणि सायकलींचे वाटप',
      '०४ जुलै २०२५ - शैक्षणिक साहित्य वाटप (स्कूल बॅग सहित) आणि सहभोजन कार्यक्रम',
      '१० जुलै २०२५ - गरजू विद्यार्थिनीला शैक्षणिक शुल्क (फी) भरण्यास शैक्षणिक सहकार्य',
      '१९ ऑक्टोबर २०२५ - दिवाळी निमित्त दिवाळीतील वस्तूसोबत शैक्षणिक साहित्य वाटप',
      '१४ नोव्हेंबर २०२५ - ब्लेसिंग चिल्ड्रन होम येथील मुलांसोबत सहभोजन कार्यक्रम व शैक्षणिक साहित्य वाटप',
    ],
    arogya: ['रक्तदान अभियान', 'औषध सहाय्य', 'शस्त्रक्रिया सहाय्य', 'आरोग्य मार्गदर्शन'],
    samaj: ['अन्नदान', 'पूरग्रस्त मदत', 'बालकल्याण', 'सण विशेष उपक्रम'],
  },
};

async function readJson(pathname, fallback) {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    if (!blobs.length) return fallback;
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return await res.json();
  } catch (err) {
    console.error('readJson error for', pathname, err);
    return fallback;
  }
}

async function writeJson(pathname, data) {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getGallery() {
  return readJson(GALLERY_PATH, []);
}
export async function saveGallery(data) {
  return writeJson(GALLERY_PATH, data);
}
export async function getVideos() {
  return readJson(VIDEOS_PATH, []);
}
export async function saveVideos(data) {
  return writeJson(VIDEOS_PATH, data);
}
export async function getConfig() {
  return readJson(CONFIG_PATH, null);
}
export async function saveConfig(data) {
  return writeJson(CONFIG_PATH, data);
}

export async function getContent() {
  const stored = await readJson(CONTENT_PATH, null);
  if (!stored) return DEFAULT_CONTENT;
  return {
    ...DEFAULT_CONTENT,
    ...stored,
    points: { ...DEFAULT_CONTENT.points, ...(stored.points || {}) },
  };
}
export async function saveContent(data) {
  return writeJson(CONTENT_PATH, data);
}

export async function getAchievements() {
  return readJson(ACHIEVEMENTS_PATH, []);
}
export async function saveAchievements(data) {
  return writeJson(ACHIEVEMENTS_PATH, data);
}

export async function uploadFile(pathnamePrefix, filename, buffer, contentType) {
  const safeBase = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60);
  const ext = (filename.split('.').pop() || 'bin').toLowerCase();
  const blob = await put(`${pathnamePrefix}/${safeBase}.${ext}`, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deleteFileIfOwned(url) {
  try {
    if (typeof url === 'string' && url.includes('.public.blob.vercel-storage.com/uploads/')) {
      await del(url);
    }
  } catch (err) {
    console.error('deleteFileIfOwned error', err);
  }
}

export function newId(prefix) {
  return prefix + Date.now().toString(16) + Math.floor(Math.random() * 900 + 100);
}
