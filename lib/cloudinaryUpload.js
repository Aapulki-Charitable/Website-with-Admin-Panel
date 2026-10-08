// Browser-side helper: signed direct upload to Cloudinary (bypasses Vercel's 4.5MB body limit).
export async function uploadToCloudinary(file, folder) {
  // 1. Get secure signature from our backend (NO preset needed!)
  const signRes = await fetch('/api/admin/cloudinary-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });

  if (!signRes.ok) {
    const errData = await signRes.json().catch(() => ({}));
    throw new Error(errData?.error || 'अपलोड स्वाक्षरी मिळवता आली नाही.');
  }

  const { signature, timestamp, apiKey, cloudName } = await signRes.json();

  // 2. Upload directly from browser to Cloudinary via signed upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Cloudinary वर फाईल अपलोड अयशस्वी झाले.');
  }

  const uploadData = await uploadRes.json();
  return uploadData.secure_url;
}
