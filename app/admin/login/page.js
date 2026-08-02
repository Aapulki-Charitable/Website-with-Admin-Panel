import { redirect } from 'next/navigation';
import { isLoggedIn } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  if (await isLoggedIn()) {
    redirect('/admin/dashboard');
  }
  const error = searchParams?.error;
  const locked = searchParams?.locked;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        background:
          'radial-gradient(circle at 20% 20%, rgba(245,124,0,0.18), transparent 40%), radial-gradient(circle at 80% 80%, rgba(13,110,189,0.18), transparent 40%), #10131c',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#fff',
          borderRadius: 20,
          padding: '40px 32px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg,#F57C00,#0D6EBD)',
          }}
        />
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              margin: '0 auto 14px',
              background: 'linear-gradient(135deg,#F57C00,#E65100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontFamily: "'Noto Serif Devanagari', serif",
              fontSize: 26,
              fontWeight: 700,
              boxShadow: '0 6px 18px rgba(245,124,0,0.4)',
            }}
          >
            आ
          </div>
          <h1
            style={{
              fontFamily: "'Noto Serif Devanagari', serif",
              fontSize: 19,
              color: '#E65100',
              fontWeight: 700,
              margin: 0,
            }}
          >
            आपुलकी अ‍ॅडमिन
          </h1>
          <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>गॅलरी व व्हिडिओ व्यवस्थापन</p>
        </div>

        {locked ? (
          <div
            style={{
              marginTop: 16,
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              background: '#fdecea',
              color: '#b3261e',
              textAlign: 'center',
            }}
          >
            खूप चुकीचे प्रयत्न झाले. कृपया ५ मिनिटांनी पुन्हा प्रयत्न करा.
          </div>
        ) : (
          <form method="POST" action="/api/admin/login" autoComplete="off">
            <label
              htmlFor="username"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, margin: '16px 0 6px' }}
            >
              युजरनेम
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1.5px solid #e2e2e6',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, margin: '16px 0 6px' }}
            >
              पासवर्ड
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1.5px solid #e2e2e6',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: 24,
                padding: 13,
                border: 'none',
                borderRadius: 50,
                background: 'linear-gradient(135deg,#F57C00,#E65100)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(245,124,0,0.35)',
              }}
            >
              लॉगिन करा
            </button>
            {error && (
              <div
                style={{
                  marginTop: 16,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  background: '#fdecea',
                  color: '#b3261e',
                  textAlign: 'center',
                }}
              >
                चुकीचे युजरनेम किंवा पासवर्ड.
              </div>
            )}
          </form>
        )}

        <a
          href="/"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 20,
            fontSize: 12,
            color: '#555',
            textDecoration: 'none',
          }}
        >
          &larr; वेबसाईटवर परत जा
        </a>
      </div>
    </div>
  );
}
