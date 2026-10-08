'use client';

import { useState } from 'react';
import { uploadToCloudinary } from '../lib/cloudinaryUpload';

const labelStyle = { fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 };
const checkStyle = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer' };

export default function CampaignForm({ tab }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | error
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState('');

  const busy = status === 'uploading';

  function handleFileChange(e) {
    const file = e.target.files[0];
    setPreview(file ? URL.createObjectURL(file) : '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const file = form.elements.image.files[0];
    const formLink = form.elements.formLink.value.trim();

    if (!file) {
      setStatus('error');
      setErrorMsg('कृपया मोहिमेचा फोटो निवडा.');
      return;
    }
    if (formLink && !/^https?:\/\/\S+$/i.test(formLink)) {
      setStatus('error');
      setErrorMsg('फॉर्म लिंक https:// ने सुरू होणारी वैध लिंक असावी.');
      return;
    }

    setStatus('uploading');
    setErrorMsg('');

    try {
      const imageUrl = await uploadToCloudinary(file, 'aapulki/campaigns');

      const res = await fetch('/api/admin/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'campaign',
          url: imageUrl,
          socialCaption: form.elements.socialCaption.value,
          websiteText: form.elements.websiteText.value,
          formLink,
          postWebsite: form.elements.postWebsite.checked,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'सेव्ह करता आले नाही.');
      }

      window.location.href = `/admin/dashboard?tab=${tab}&flash=${encodeURIComponent(
        'नवीन मोहीम यशस्वीरित्या जोडली गेली.'
      )}&flashType=ok`;
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'अपलोड अयशस्वी झाले.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 14 }}>
        <div className="field" style={{ flex: '0 1 260px' }}>
          <label style={labelStyle}>मोहिमेचा फोटो / पोस्टर *</label>
          <input
            type="file"
            name="image"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            required
            disabled={busy}
            onChange={handleFileChange}
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              style={{ marginTop: 10, width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 10, background: '#f1f2f4' }}
            />
          )}
          <p style={{ fontSize: 11.5, color: '#777', marginTop: 6 }}>कमाल आकार: 10MB</p>
        </div>

        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label style={labelStyle}>वेबसाईटवरील मजकूर (Website Text)</label>
            <textarea
              name="websiteText"
              placeholder="उदा. रविवार, २५ ऑक्टोबर रोजी भव्य रक्तदान शिबिर. स्थळ: ... वेळ: सकाळी ९ ते दुपारी २"
              style={{ minHeight: 90, resize: 'vertical' }}
              disabled={busy}
            />
          </div>
          <div className="field">
            <label style={labelStyle}>Instagram व Facebook कॅप्शन (दोन्हीसाठी एकच)</label>
            <textarea
              name="socialCaption"
              placeholder="सोशल मीडिया पोस्टसाठी कॅप्शन व हॅशटॅग..."
              style={{ minHeight: 70, resize: 'vertical' }}
              disabled={busy}
            />
          </div>
          <div className="field">
            <label style={labelStyle}>नोंदणी फॉर्म लिंक (Google Form)</label>
            <input type="url" name="formLink" placeholder="https://forms.gle/..." disabled={busy} />
            <p style={{ fontSize: 11.5, color: '#777', marginTop: 4 }}>
              लिंक रिकामी ठेवल्यास वेबसाईटवर &quot;नोंदणी करा&quot; बटण दिसणार नाही.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: '#fbfbfd', border: '1px solid #ececf1', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>कुठे पोस्ट करायचे?</div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          <label style={checkStyle}>
            <input type="checkbox" name="postWebsite" defaultChecked disabled={busy} /> वेबसाईटवर पोस्ट करा
          </label>
          <label style={{ ...checkStyle, color: '#999', cursor: 'not-allowed' }} title="Meta ॲप जोडल्यानंतर उपलब्ध होईल">
            <input type="checkbox" disabled /> Instagram वर पोस्ट करा
          </label>
          <label style={{ ...checkStyle, color: '#999', cursor: 'not-allowed' }} title="Meta ॲप जोडल्यानंतर उपलब्ध होईल">
            <input type="checkbox" disabled /> Facebook वर पोस्ट करा
          </label>
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? 'अपलोड होत आहे...' : 'मोहीम जोडा'}
      </button>

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
