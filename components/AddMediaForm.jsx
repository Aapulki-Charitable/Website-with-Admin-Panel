'use client';

import { useState } from 'react';

export default function AddMediaForm({ kind, category, tab }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | error
  const [errorMsg, setErrorMsg] = useState('');

  const isImage = kind === 'image' || kind === 'achievement';
  const accept = isImage ? '.jpg,.jpeg,.png,.webp,.gif' : '.mp4,.webm,.mov';
  const maxLabel = isImage ? '10MB' : '100MB';
  const folder =
    kind === 'image'
      ? 'aapulki/gallery'
      : kind === 'achievement'
      ? 'aapulki/achievements'
      : 'aapulki/videos';
  const fieldName = isImage ? 'image' : 'video';

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const file = form.elements[fieldName].files[0];
    const caption = form.elements.caption ? form.elements.caption.value : '';
    const tag = form.elements.tag ? form.elements.tag.value : '';
    const title = form.elements.title ? form.elements.title.value : caption;
    const description = form.elements.description ? form.elements.description.value : '';

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

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Cloudinary वर फाईल अपलोड अयशस्वी झाले.');
      }

      const uploadData = await uploadRes.json();
      const mediaUrl = uploadData.secure_url;

      // 3. Save metadata to /api/admin/add-item
      const res = await fetch('/api/admin/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: kind,
          url: mediaUrl,
          caption: title || caption,
          title: title || caption,
          tag: tag || '',
          description: description || '',
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'सेव्ह करता आले नाही.');
      }

      const successMsg =
        kind === 'achievement'
          ? 'नवीन गौरव नोंद यशस्वीरित्या जोडली गेली.'
          : isImage
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
      {kind === 'achievement' ? (
        <>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
            <div className="field" style={{ flex: '1 1 240px', maxWidth: 300 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600 }}>फोटो निवडा *</label>
              <input
                type="file"
                name={fieldName}
                accept={accept}
                required
                disabled={status === 'uploading'}
              />
            </div>
            <div className="field" style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 12.5, fontWeight: 600 }}>पिल / बॅज मजकूर (उदा. राज्यस्तरीय पुरस्कार • २०२५)</label>
              <input
                type="text"
                name="tag"
                placeholder="उदा. सन्मान व गौरव किंवा ठाणे वार्ता"
                disabled={status === 'uploading'}
              />
            </div>
            <div className="field" style={{ flex: '1 1 260px' }}>
              <label style={{ fontSize: 12.5, fontWeight: 600 }}>शीर्षक - मोठे केशरी अक्षरे *</label>
              <input
                type="text"
                name="title"
                placeholder="उदा. सह्याद्री रत्न पुरस्कार २०२५"
                required
                disabled={status === 'uploading'}
              />
            </div>
          </div>
          <div className="field" style={{ width: '100%', marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600 }}>सविस्तर माहिती / परिच्छेद</label>
            <textarea
              name="description"
              placeholder="पुरस्कार, उपक्रम किंवा बातमीबद्दल सविस्तर माहिती लिहा..."
              style={{ minHeight: 70, resize: 'vertical' }}
              disabled={status === 'uploading'}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={status === 'uploading'}>
            {status === 'uploading' ? 'अपलोड होत आहे...' : 'गौरव नोंद जोडा'}
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ maxWidth: 260 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600 }}>
              {isImage ? 'फोटो निवडा' : 'व्हिडिओ निवडा'}
            </label>
            <input
              type="file"
              name={fieldName}
              accept={accept}
              required
              disabled={status === 'uploading'}
            />
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
      )}
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
