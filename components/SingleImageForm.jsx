'use client';

import { useState } from 'react';

export default function SingleImageForm({ field, tab }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const file = form.elements.image.files[0];

    if (!file) {
      setStatus('error');
      setErrorMsg('कृपया फाईल निवडा.');
      return;
    }

    setStatus('uploading');
    setErrorMsg('');

    try {
      // 1. Get secure signature from our backend (NO preset needed!)
      const signRes = await fetch('/api/admin/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'aapulki/site' }),
      });

      if (!signRes.ok) {
        const errData = await signRes.json().catch(() => ({}));
        throw new Error(errData?.error || 'अपलोड स्वाक्षरी मिळवता आली नाही.');
      }

      const { signature, timestamp, apiKey, cloudName } = await signRes.json();

      // 2. Upload directly from browser to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'aapulki/site');

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Cloudinary वर अपलोड अयशस्वी झाले.');
      }

      const uploadData = await uploadRes.json();
      const mediaUrl = uploadData.secure_url;

      // 3. Save new image URL
      const res = await fetch('/api/admin/set-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, url: mediaUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'सेव्ह करता आले नाही.');
      }

      window.location.href = `/admin/dashboard?tab=${tab}&flash=${encodeURIComponent(
        'फोटो अपडेट झाला.'
      )}&flashType=ok`;
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'अपलोड अयशस्वी झाले.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ maxWidth: 260 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600 }}>नवीन फोटो निवडा</label>
          <input
            type="file"
            name="image"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            required
            disabled={status === 'uploading'}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={status === 'uploading'}>
          {status === 'uploading' ? 'अपलोड होत आहे...' : 'फोटो बदला'}
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: '#777', marginTop: 8 }}>कमाल आकार: 10MB</p>
      {status === 'error' && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13,
            background: '#fdecea',
            color: '#b3261e',
          }}
        >
          {errorMsg}
        </div>
      )}
    </form>
  );
}
