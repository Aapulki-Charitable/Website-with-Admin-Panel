/**
 * One-time seed script for Cloudinary.
 *
 * Populates your Cloudinary account with the original gallery photos and videos
 * from your site (so the homepage isn't empty on first deploy), pointing at
 * the local `assets/` folder.
 *
 * Usage:
 *   1. Make sure .env.local has your Cloudinary credentials
 *      (see README-CLOUDINARY-SETUP.md for how to get them).
 *   2. Run:  npm run seed
 *
 * Safe to run more than once — it overwrites aapulki/data/gallery.json and
 * aapulki/data/videos.json in Cloudinary.
 */
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

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
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error(
      '\n❌ Missing Cloudinary credentials in .env.local.\n' +
        'Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET first (see README-CLOUDINARY-SETUP.md), then re-run: npm run seed\n'
    );
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  async function uploadRawJson(publicId, data) {
    const base64 = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const dataUri = `data:application/json;base64,${base64}`;
    await cloudinary.uploader.upload(dataUri, {
      resource_type: 'raw',
      public_id: publicId,
      overwrite: true,
      invalidate: true,
    });
  }

  await uploadRawJson('aapulki/data/gallery.json', gallery);
  console.log(`✔ Seeded ${gallery.length} gallery photos to Cloudinary`);

  await uploadRawJson('aapulki/data/videos.json', videos);
  console.log(`✔ Seeded ${videos.length} videos to Cloudinary`);

  console.log('\nDone. Your homepage gallery/videos are ready in Cloudinary!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
