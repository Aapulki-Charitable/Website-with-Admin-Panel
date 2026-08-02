'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

export default function AddMediaForm({ kind, category, tab }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | error
  const [errorMsg, setErrorMsg] = useState('');

  const isImage = kind === 'image' || kind === 'achievement';
  const accept = isImage ? '.jpg,.jpeg,.png,.webp,.gif' : '.mp4,.webm,.mov';
  const maxLabel = isImage ? '8MB' : '100MB';
  const folder = kind === 'image' ? 'uploads/gallery' : kind === 'achievement' ? 'uploads/achievements' : 'uploads/videos';
  const fieldName = isImage ? 'image' : 'video';

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const file = form.elements[fieldName].files[0];
    const caption = form.elements.caption.value;

    if (!file) {
      setStatus('error');
      setErrorMsg('कृपया फाईल निवडा.');
      return;
    }

    setStatus('uploading');
    setErrorMsg('');

    try {
      const blob = await upload(`${folder}/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/blob-upload',
      });

      const res = await fetch('/api/admin/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: kind,
          url: blob.url,
          caption,
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'सेव्ह करता आले नाही.');
      }

      const successMsg = isImage
        ? 'नवीन फोटो यशस्वीरित्या जोडला गेला.'
        : 'नवीन व्हिडिओ यशस्वीरित्या जोडला गेला.';
      window.location.href = `/admin/dashboard?tab=${tab}&flash=${encodeURIComponent(
        successMsg
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
          <label style={{ fontSize: 12.5, fontWeight: 600 }}>
            {isImage ? 'फोटो निवडा' : 'व्हिडिओ निवडा'}
          </label>
          <input type="file" name={fieldName} accept={accept} required disabled={status === 'uploading'} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 180 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600 }}>कॅप्शन</label>
          <input
            type="text"
            name="caption"
            placeholder={isImage ? 'उदा. शैक्षणिक साहित्य वितरण' : 'उदा. सायकल वाटप उपक्रम'}
            disabled={status === 'uploading'}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={status === 'uploading'}>
          {status === 'uploading' ? 'अपलोड होत आहे...' : 'जोडा'}
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: '#777', marginTop: 8 }}>कमाल आकार: {maxLabel}</p>
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
