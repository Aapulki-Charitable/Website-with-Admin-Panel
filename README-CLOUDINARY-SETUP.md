# आपुलकी चॅरिटेबल ट्रस्ट — Cloudinary Setup Guide (100% Free, Zero Card, No Presets Needed)

Your project is now fully configured to use **Signed Cloudinary Uploads**. 
You **DO NOT** need to configure any upload presets, and you **DO NOT** need to upgrade anything.

---

## 1. What was configured

Your `.env` and `.env.local` files are already configured with your Cloudinary credentials:
- **Cloud Name:** `xs8qoehu`
- **API Key:** `969748147247182`
- **API Secret:** Configured
- **Session Secret:** Generated and configured

---

## 2. Seed Data Status

The initial seed script was executed successfully:
```
✔ Seeded 18 gallery photos to Cloudinary
✔ Seeded 6 videos to Cloudinary
```
Your homepage and admin panel can now read all photos and videos directly from Cloudinary.

---

## 3. Deployment to Vercel

To deploy your site on Vercel:

1. Push your updated code to GitHub:
   ```bash
   git add .
   git commit -m "Configure Cloudinary signed uploads"
   git push
   ```
2. In your Vercel Dashboard:
   - Go to your Project → **Settings** → **Environment Variables**.
   - Add the following variables (copy values from your `.env.local`):
     - `SESSION_SECRET`
     - `ADMIN_USERNAME`
     - `ADMIN_DEFAULT_PASSWORD`
     - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
3. Click **Redeploy** on Vercel (or trigger a new deploy via Git).

---

## 4. Admin Panel Access

- **URL:** `https://your-site.vercel.app/admin` (or `https://aapulkicharitabletrust.com/admin`)
- **Default Username:** `admin`
- **Default Password:** `Aapulki@2026`
- **Uploads:** Photos and videos upload directly from the admin's browser to Cloudinary via cryptographic server signature, with automatic video/image compression and zero serverless timeouts.
