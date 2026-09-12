import fs from 'fs';
import path from 'path';
import { getGallery, getVideos, getContent, getAchievements } from '../lib/blob';

export const dynamic = 'force-dynamic';

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderGalleryItems(items) {
  return items
    .map(
      (g) =>
        `<div class="initiative-image-card"><img src="${escapeHtml(
          g.image
        )}"><p>${escapeHtml(g.caption)}</p></div>`
    )
    .join('\n');
}

function renderPoints(points) {
  return (points || []).map((p) => `<li>${escapeHtml(p)}</li>`).join('\n');
}

function renderAchievementItems(items) {
  return items
    .map((a, i) => {
      const reverse = i % 2 === 1;
      const media = `<div class="award-media"><img src="${escapeHtml(a.image)}" alt="${escapeHtml(
        a.caption
      )}"></div>`;
      const text = `<div>
        <div class="award-badge-tag"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px;">military_tech</span> सन्मान व गौरव</div>
        <h3 class="award-title">${escapeHtml(a.caption)}</h3>
      </div>`;
      return `<div class="achievement-slide">
  <div class="award-showcase">
    <div class="award-grid${reverse ? ' reverse' : ''}">
      ${reverse ? text + media : media + text}
    </div>
  </div>
</div>`;
    })
    .join('\n');
}

function renderVideoItems(items) {
  return items
    .map(
      (v) => `<div class="video-card">
          <video preload="metadata" onclick="toggleVideo(this)">
            <source src="${escapeHtml(v.video)}" type="video/mp4">
          </video>
          <div class="video-info">
            <h7><br></h7>
            <p>${escapeHtml(v.caption)}</p>
            <br>
          </div>
        </div>`
    )
    .join('\n');
}

export async function GET() {
  const [gallery, videos, content, achievements] = await Promise.all([
    getGallery(),
    getVideos(),
    getContent(),
    getAchievements(),
  ]);

  const shikshan = gallery.filter((g) => g.category === 'shikshan');
  const arogya = gallery.filter((g) => g.category === 'arogya');
  const samaj = gallery.filter((g) => g.category === 'samaj');

  const templatePath = path.join(process.cwd(), 'content', 'site-template.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  const aboutImageHtml = `<img src="${escapeHtml(
    content.aboutImage
  )}" alt="आपुलकी ट्रस्ट" style="width:100%;height:100%;object-fit:cover;border-radius:24px;">`;
  const aboutImageLabelHtml = `<div class="about-img-label">${escapeHtml(
    content.aboutImageName
  )}<br><small>${escapeHtml(content.aboutImageRole)}</small></div>`;
  const karyakarteImageHtml = `<img src="${escapeHtml(content.karyakarteImage)}" alt="आमचे कार्यकर्ते">`;

  html = html
    .replace('{{GALLERY_SHIKSHAN}}', renderGalleryItems(shikshan))
    .replace('{{GALLERY_AROGYA}}', renderGalleryItems(arogya))
    .replace('{{GALLERY_SAMAJ}}', renderGalleryItems(samaj))
    .replace('{{VIDEOS}}', renderVideoItems(videos))
    .replace('{{ABOUT_IMAGE}}', aboutImageHtml)
    .replace('{{ABOUT_IMAGE_LABEL}}', aboutImageLabelHtml)
    .replace('{{KARYAKARTE_IMAGE}}', karyakarteImageHtml)
    .replace('{{POINTS_SHIKSHAN}}', renderPoints(content.points.shikshan))
    .replace('{{POINTS_AROGYA}}', renderPoints(content.points.arogya))
    .replace('{{POINTS_SAMAJ}}', renderPoints(content.points.samaj))
    .replace('{{ACHIEVEMENTS_EXTRA}}', renderAchievementItems(achievements))
    .replace('{{HERO_BG_IMAGE}}', escapeHtml(content.heroBgImage || 'assets/HERO SECTION IMAGE.jpg'));

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
