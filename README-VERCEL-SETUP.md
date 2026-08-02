# आपुलकी चॅरिटेबल ट्रस्ट — Admin Panel (Vercel version)

This is a Next.js rebuild of the admin panel, made for your Vercel +
custom-domain setup. Since Vercel doesn't run PHP and its filesystem isn't
writable at runtime, photos/videos and their captions are stored in
**Vercel Blob** instead of on disk. Uploads go directly from your browser
to Blob storage (not through a serverless function), so large videos don't
hit Vercel's ~4.5MB request body limit.

## What's in here

- `app/route.js` — serves your public site at `/`. It reads
  `content/site-template.html` (your original design, untouched) and fills
  in the gallery/video sections from Blob data at request time.
- `app/admin/` — the password-protected admin pages (`/admin/login`,
  `/admin/dashboard`).
- `app/api/admin/` — server endpoints: login, logout, edit/delete actions,
  the direct-upload authorizer, and the "save metadata after upload"
  endpoint.
- `components/AddMediaForm.jsx` — the upload form; uploads straight to
  Blob from the browser, then tells the server the resulting URL + caption.
- `lib/blob.js` — reads/writes your gallery and video data as JSON files in
  Vercel Blob.
- `lib/auth.js` — password checking (bcrypt) and signed login sessions.
- `content/site-template.html` — your original site's HTML/CSS/JS, with the
  hard-coded gallery photos and videos replaced by placeholders that get
  filled in dynamically.
- `scripts/seed.js` — one-time script that populates your Blob storage
  with your original 18 photos + 6 videos, so the homepage isn't empty the
  first time you deploy (see step 6 below).

I also fixed a few pre-existing issues in your original file: two broken
paths that used Windows-style backslashes (`assets\news.mp4` etc, which
wouldn't have worked on a real server), and **all image/video files now
live in a single `assets/` folder** instead of being split across
`assets/` and `images/` like the original — one less thing to keep track
of.

## One-time setup on Vercel

1. **Connect a Blob store** to this project: in your Vercel dashboard, open
   the project → **Storage** tab → **Create Database** → choose **Blob** →
   connect it to this project. Vercel automatically adds a
   `BLOB_READ_WRITE_TOKEN` environment variable for you — nothing to
   copy/paste for this part on the deployed side.

2. **Add one environment variable yourself**: Project → **Settings** →
   **Environment Variables** →
   ```
   SESSION_SECRET = <any long random string>
   ```
   Generate one locally with:
   ```bash
   openssl rand -hex 32
   ```
   This signs admin login sessions — treat it like a password.

3. (Optional) Set `ADMIN_USERNAME` / `ADMIN_DEFAULT_PASSWORD` here too if
   you want a different starting login — or just use the default below and
   change it from the dashboard after first login.

4. **Add your real site images/videos** into `public/assets/` — see
   "Where your images/videos go" below for the exact file list. This one
   folder now holds everything (photos, videos, logo, hero image, etc).

5. **Deploy** — push to your GitHub repo (or however you deploy to
   Vercel currently).

6. **Seed your gallery data** (do this once, after step 1 and after you
   have a real `BLOB_READ_WRITE_TOKEN`):
   ```bash
   npm install
   cp .env.example .env.local
   # paste your real BLOB_READ_WRITE_TOKEN into .env.local (see below for where to find it)
   npm run seed
   ```
   Without this step, your homepage gallery/video sections will simply be
   empty until you manually re-add every photo through the admin panel —
   this script just saves you from having to re-type in 18 photos + 6
   videos worth of captions by hand.

## Where your images/videos go

Everything goes in **one folder**: `public/assets/`. Copy your original
site's images/videos in there using these exact filenames (spaces and all
— if a name doesn't match exactly, that file will show broken):

```
edu things donation.png
educational progs.png
Kids cycle donation collage.jpg
kids with cycle.jpg
cycle donation.png
newspaper.png
free operations.png
medicines.png
meds.png
cooler.png
253 donors.png
blood donation camp.png
flood relief.png
flood relief call.png
holi.png
diwali.png
news article.png
Akshay tritiya dina nimitta blessing home orphange mad....png
transparewnt logo.png
apulki logo.png
awards.jpg
amche karyakarte.jpg
news article.jpg
Akshay tritiya dina nimitta  blessing home orphange madhe annadan vatap.mp4
news.mp4
shaishnik sahitya vatap karyakram.mp4
diwali Pahat vaitagwadi yethe kandil,faral,fatakhe,khau,ani shaley vastu vatap karun diwali sun sajara kearnyat ala.mp4
cycle donation.mp4
blood donation video.mp4
```

## Default login

- **URL:** `aapulkicharitabletrust.com/admin`
- **Username:** `admin`
- **Password:** `Aapulki@2026`

**Change this immediately** after first login, from the "खाते सेटिंग्ज"
(Account Settings) tab — this updates a small config file in your Blob
store, no redeploy needed.

## Running locally (optional)

```bash
npm install
cp .env.example .env.local
# edit .env.local: set SESSION_SECRET, and if you want to test real login/
# uploads, grab a BLOB_READ_WRITE_TOKEN from your Vercel project settings
# and paste it in (see below)
npm run dev
```
Then open `http://localhost:3000`.

Without a real `BLOB_READ_WRITE_TOKEN`, the public homepage still works,
but the admin panel's login/dashboard will error out — there's nowhere to
check your password against or save anything to. Gallery/video management
only fully works once you've connected Blob storage and put a real token
in `.env.local` (or once deployed to Vercel with Blob connected).

**Finding your token:** Vercel dashboard → your project → **Storage** →
your Blob store → look for `BLOB_READ_WRITE_TOKEN` under its
Environment Variables / ".env.local" tab.

## Using the admin panel

- **शिक्षण / आरोग्य / समाज कल्याण tabs** — upload a new photo with a
  caption, or edit/delete/move existing ones between categories.
- **व्हिडिओ tab** — upload new videos with captions, or edit/delete
  existing ones.
- **खाते सेटिंग्ज tab** — change your admin password.
- Deleting a photo/video removes it from the site's list, and — if it was
  uploaded through the admin panel — deletes the file from Blob storage
  too. Files under `public/assets/` (your original design assets) are
  never touched by delete actions.

## Limits

- Photos: 8MB max, jpg/jpeg/png/webp/gif only.
- Videos: 100MB max, mp4/webm/mov only. Because uploads go directly from
  the browser to Blob storage, this limit is enforced by Blob itself, not
  by a serverless function — so large videos should work reliably.
- The site uses `force-dynamic` rendering, so gallery/video changes appear
  immediately without a rebuild or redeploy.
