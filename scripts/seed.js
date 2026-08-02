/**
 * One-time seed script.
 *
 * Populates your Blob storage with the original gallery photos and videos
 * from your site (so the homepage isn't empty on first deploy), all
 * pointing at the single `assets/` folder.
 *
 * Usage:
 *   1. Make sure .env.local has a real BLOB_READ_WRITE_TOKEN in it
 *      (see README-VERCEL-SETUP.md for how to get one).
 *   2. Run:  npm run seed
 *
 * Safe to run more than once — it always overwrites data/gallery.json and
 * data/videos.json with this exact list. If you've already added/edited
 * things from the admin dashboard, running this again will wipe those
 * changes back to the originals below, so only run it once, early on.
 */
require('dotenv').config({ path: '.env.local' });
const { put } = require('@vercel/blob');

const gallery = [
  { id: 'g1001', category: 'shikshan', image: 'assets/edu things donation.png', caption: 'शैक्षणिक साहित्य वितरण' },
  { id: 'g1002', category: 'shikshan', image: 'assets/educational progs.png', caption: 'शैक्षणिक कार्यक्रम' },
  { id: 'g1003', category: 'shikshan', image: 'assets/Kids cycle donation collage.jpg', caption: 'सायकल वितरण उपक्रम' },
  { id: 'g1004', category: 'shikshan', image: 'assets/kids with cycle.jpg', caption: 'सायकल मिळालेली मुले' },
  { id: 'g1005', category: 'shikshan', image: 'assets/cycle donation.png', caption: 'सायकल देणगी' },
  { id: 'g1006', category: 'shikshan', image: 'assets/newspaper.png', caption: 'शैक्षणिक साहित्य देणगी' },

  { id: 'g2001', category: 'arogya', image: 'assets/free operations.png', caption: 'मोफत शस्त्रक्रिया सहाय्य' },
  { id: 'g2002', category: 'arogya', image: 'assets/medicines.png', caption: 'औषध वितरण' },
  { id: 'g2003', category: 'arogya', image: 'assets/meds.png', caption: 'औषध सहाय्य' },
  { id: 'g2004', category: 'arogya', image: 'assets/cooler.png', caption: 'उन्हाळा सहाय्य' },
  { id: 'g2005', category: 'arogya', image: 'assets/253 donors.png', caption: 'रक्तदाते नेटवर्क' },
  { id: 'g2006', category: 'arogya', image: 'assets/blood donation camp.png', caption: 'रक्तदान शिबीर' },

  { id: 'g3001', category: 'samaj', image: 'assets/flood relief.png', caption: 'पूरग्रस्त मदत' },
  { id: 'g3002', category: 'samaj', image: 'assets/flood relief call.png', caption: 'पूरमदत अभियान' },
  { id: 'g3003', category: 'samaj', image: 'assets/holi.png', caption: 'रंग आपुलकीचा' },
  { id: 'g3004', category: 'samaj', image: 'assets/diwali.png', caption: 'दिवाळी आपुलकी' },
  { id: 'g3005', category: 'samaj', image: 'assets/news article.png', caption: 'सामाजिक कार्याची दखल' },
  { id: 'g3006', category: 'samaj', image: 'assets/Akshay tritiya dina nimitta blessing home orphange mad....png', caption: 'अन्नदान उपक्रम' },
];

const videos = [
  { id: 'v1001', video: 'assets/Akshay tritiya dina nimitta  blessing home orphange madhe annadan vatap.mp4', caption: 'अक्षय तृतीयेच्या निमित्ताने ब्लेसिंग होम अनाथाश्रमामध्ये अन्नदान कार्यक्रम आयोजित करण्यात आला.' },
  { id: 'v1002', video: 'assets/news.mp4', caption: 'लोकसत्यवाणी वाहिनीतर्फे आपुलकी चॅरिटेबल ट्रस्टच्या सामाजिक कार्याचे विशेष कौतुक.' },
  { id: 'v1003', video: 'assets/shaishnik sahitya vatap karyakram.mp4', caption: 'गरजू विद्यार्थ्यांसाठी शैक्षणिक साहित्य वाटप कार्यक्रम' },
  { id: 'v1004', video: 'assets/diwali Pahat vaitagwadi yethe kandil,faral,fatakhe,khau,ani shaley vastu vatap karun diwali sun sajara kearnyat ala.mp4', caption: 'वैतागवाडी येथे दिवाळी पहाट निमित्त कंदील, फराळ, फटाके व शालेय साहित्य वाटप.' },
  { id: 'v1005', video: 'assets/cycle donation.mp4', caption: 'विद्यार्थ्यांना सायकल वाटप उपक्रम राबविण्यात आला.' },
  { id: 'v1006', video: 'assets/blood donation video.mp4', caption: 'रक्तदान शिबीर उपक्रम.' },
];

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      '\n❌ Missing BLOB_READ_WRITE_TOKEN.\n' +
        'Add it to .env.local first (see README-VERCEL-SETUP.md), then re-run: npm run seed\n'
    );
    process.exit(1);
  }

  await put('data/gallery.json', JSON.stringify(gallery, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`✔ Seeded ${gallery.length} gallery photos`);

  await put('data/videos.json', JSON.stringify(videos, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`✔ Seeded ${videos.length} videos`);

  console.log('\nDone. Your homepage gallery/videos should now show up.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
