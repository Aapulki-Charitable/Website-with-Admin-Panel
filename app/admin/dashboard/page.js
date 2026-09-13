import { redirect } from 'next/navigation';
import { isLoggedIn } from '../../../lib/auth';
import { getGallery, getVideos, getContent, getAchievements } from '../../../lib/blob';
import AddMediaForm from '../../../components/AddMediaForm';
import SingleImageForm from '../../../components/SingleImageForm';

export const dynamic = 'force-dynamic';

const TABS = {
  content: { label: 'साईट प्रतिमा व मजकूर', icon: 'image' },
  shikshan: { label: 'शिक्षण', icon: 'menu_book' },
  arogya: { label: 'आरोग्य', icon: 'local_hospital' },
  samaj: { label: 'समाज कल्याण', icon: 'handshake' },
  achievements: { label: 'यश व मान्यता', icon: 'military_tech' },
  video: { label: 'व्हिडिओ', icon: 'movie' },
  account: { label: 'खाते सेटिंग्ज', icon: 'settings' },
};

export default async function DashboardPage({ searchParams }) {
  if (!(await isLoggedIn())) {
    redirect('/admin/login');
  }

  const activeTab = TABS[searchParams?.tab] ? searchParams.tab : 'content';
  const flash = searchParams?.flash;
  const flashType = searchParams?.flashType === 'error' ? 'error' : 'ok';

  const [galleryRaw, videosRaw, contentRaw, achievementsRaw] = await Promise.all([
    getGallery(),
    getVideos(),
    getContent(),
    getAchievements(),
  ]);
  const gallery = Array.isArray(galleryRaw) ? galleryRaw : [];
  const videos = Array.isArray(videosRaw) ? videosRaw : [];
  const achievements = Array.isArray(achievementsRaw) ? achievementsRaw : [];
  const content = {
    heroBgImage: 'assets/HERO SECTION IMAGE.jpg',
    aboutImage: 'assets/253 donors.png',
    aboutImageName: 'मा. श्री. प्रशांत लहू देसाई',
    aboutImageRole: 'अध्यक्ष, आपुलकी चॅरिटेबल ट्रस्ट',
    karyakarteImage: 'assets/amche karyakarte.jpg',
    marqueeText: '',
    points: {
      shikshan: [],
      arogya: [],
      samaj: [],
    },
    ...(contentRaw || {}),
    points: {
      shikshan: [],
      arogya: [],
      samaj: [],
      ...((contentRaw && contentRaw.points) || {}),
    },
  };
  const catItems = gallery.filter((g) => g.category === activeTab);

  return (
    <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", background: '#F4F5F8', minHeight: '100vh', color: '#1A1A2E' }}>
      <style>{`
        .btn{border:none;border-radius:50px;padding:10px 22px;font-size:13.5px;font-weight:600;cursor:pointer;white-space:nowrap;}
        .btn-primary{background:linear-gradient(135deg,#F57C00,#E65100);color:#fff;}
        .btn-danger{background:#fdecea;color:#D32F2F;}
        .btn-outline{background:#fff;border:1.5px solid #e2e2e6;color:#1A1A2E;}
        .btn:disabled{opacity:0.6;cursor:not-allowed;}
        .field input, .field select, .field textarea{padding:10px 12px;border-radius:8px;border:1.5px solid #e2e2e6;font-size:13.5px;font-family:inherit;width:100%;box-sizing:border-box;}
        .tabs a{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;color:#555;text-decoration:none;font-size:14px;font-weight:500;margin-bottom:4px;}
        .tabs a.active{background:#F57C00;color:#fff;}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:20px;}
        .item-card{background:#fbfbfd;border:1px solid #ececf1;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;}
        .item-card .thumb{width:100%;height:140px;object-fit:cover;background:#eee;display:block;}
        .item-card .body{padding:12px;display:flex;flex-direction:column;gap:8px;}
      `}</style>

      <header
        style={{
          background: 'linear-gradient(120deg,#1A1A2E,#232342)',
          color: '#fff',
          padding: '18px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#F57C00,#E65100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontFamily: "'Noto Serif Devanagari', serif",
            }}
          >
            आ
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>आपुलकी अ‍ॅडमिन पॅनेल</div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>गॅलरी व व्हिडिओ व्यवस्थापन</div>
          </div>
        </div>
        <form method="POST" action="/api/admin/logout">
          <button
            type="submit"
            style={{
              color: '#fff',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 50,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            लॉगआऊट
          </button>
        </form>
      </header>

      <div style={{ display: 'flex', maxWidth: 1280, margin: '0 auto' }}>
        <nav className="tabs" style={{ width: 210, flexShrink: 0, padding: '24px 12px' }}>
          {Object.entries(TABS).map(([key, t]) => (
            <a key={key} href={`?tab=${key}`} className={activeTab === key ? 'active' : ''}>
              <span className="material-symbols-outlined" style={{ fontSize: 19 }}>
                {t.icon}
              </span>{' '}
              {t.label}
            </a>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid #ececf1', margin: '14px 8px' }} />
          <a href="/" target="_blank" rel="noreferrer">
            <span className="material-symbols-outlined" style={{ fontSize: 19 }}>
              open_in_new
            </span>{' '}
            साईट पहा
          </a>
        </nav>

        <main style={{ flex: 1, padding: '24px 28px 60px', minWidth: 0 }}>
          {flash && (
            <div
              style={{
                padding: '13px 18px',
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 20,
                fontWeight: 500,
                background: flashType === 'error' ? '#fdecea' : '#e7f6e8',
                color: flashType === 'error' ? '#b3261e' : '#256029',
                border: `1px solid ${flashType === 'error' ? '#f4c2bd' : '#b7e1bb'}`,
              }}
            >
              {flash}
            </div>
          )}

          {['shikshan', 'arogya', 'samaj'].includes(activeTab) && (
            <>
              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>{TABS[activeTab].label} - "आपुलकीचे कार्य" यादी</h2>
                <p style={{ fontSize: 12.5, color: '#555', marginBottom: 18 }}>
                  गॅलरी विभागातील {TABS[activeTab].label} कार्डाखाली दिसणारी यादी. प्रत्येक ओळ एक मुद्दा आहे.
                </p>
                <form method="POST" action="/api/admin/actions">
                  <input type="hidden" name="action" value="update_points" />
                  <input type="hidden" name="category" value={activeTab} />
                  <input type="hidden" name="tab" value={activeTab} />
                  <div className="field">
                    <textarea
                      name="points"
                      defaultValue={(content.points[activeTab] || []).join('\n')}
                      style={{ minHeight: 130, resize: 'vertical' }}
                    />
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ marginTop: 10 }}>
                    यादी सेव्ह करा
                  </button>
                </form>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>{TABS[activeTab].label} - नवीन फोटो जोडा</h2>
                <p style={{ fontSize: 12.5, color: '#555', marginBottom: 18 }}>
                  इमेज अपलोड करा (JPG / PNG / WEBP) आणि त्याखाली दिसणारी कॅप्शन लिहा.
                </p>
                <AddMediaForm kind="image" category={activeTab} tab={activeTab} />
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>सध्याचे फोटो ({catItems.length})</h2>
                {catItems.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#555', padding: '16px 0', textAlign: 'center' }}>
                    या प्रकारात अजून कोणताही फोटो नाही.
                  </div>
                ) : (
                  <div className="grid">
                    {catItems.map((item) => (
                      <div className="item-card" key={item.id}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="thumb" src={item.image} alt="" />
                        <div className="body">
                          <form method="POST" action="/api/admin/actions">
                            <input type="hidden" name="action" value="edit_image" />
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="tab" value={activeTab} />
                            <textarea
                              name="caption"
                              defaultValue={item.caption}
                              style={{ minHeight: 44, resize: 'vertical' }}
                            />
                            <select name="category" defaultValue={item.category} style={{ marginTop: 6 }}>
                              {['shikshan', 'arogya', 'samaj'].map((ck) => (
                                <option key={ck} value={ck}>
                                  {TABS[ck].label}
                                </option>
                              ))}
                            </select>
                            <button className="btn btn-outline" type="submit" style={{ width: '100%', marginTop: 6 }}>
                              सेव्ह करा
                            </button>
                          </form>
                          <form method="POST" action="/api/admin/actions">
                            <input type="hidden" name="action" value="delete_image" />
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="tab" value={activeTab} />
                            <button className="btn btn-danger" type="submit" style={{ width: '100%', marginTop: 6 }}>
                              काढा
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'content' && (
            <>
              {/* Marquee Announcement Bar */}
              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
                  <h2 style={{ margin: 0, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: '#F57C00' }}>campaign</span>
                    महत्त्वाची सूचना पट्टी (Marquee Announcement Bar)
                  </h2>
                  {content.marqueeText ? (
                    <span style={{ background: '#e7f6e8', color: '#256029', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600 }}>
                      ● सुरु आहे (Active)
                    </span>
                  ) : (
                    <span style={{ background: '#f1f2f4', color: '#777', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600 }}>
                      ○ बंद / लपवलेली (No Marquee)
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: '#555', marginBottom: 16 }}>
                  वेबसाईटच्या शीर्षस्थानी फिरणारी केसरी रंगाची सूचना पट्टी (Orange Marquee). येथे मजकूर टाकल्यास पट्टी आपोआप दिसेल. मजकूर रिकामा ठेवल्यास पट्टी पूर्णपणे लपवली जाईल.
                </p>

                {content.marqueeText && (
                  <div style={{
                    background: 'linear-gradient(90deg, #F57C00, #E65100)',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '10px 16px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 2px 8px rgba(245,124,0,0.25)',
                  }}>
                    <span style={{ fontSize: 16 }}>📢</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {content.marqueeText}
                    </span>
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 20 }}>
                      लाईव्ह प्रिव्ह्यू
                    </span>
                  </div>
                )}

                <form method="POST" action="/api/admin/actions">
                  <input type="hidden" name="action" value="update_marquee" />
                  <input type="hidden" name="tab" value="content" />
                  <div className="field">
                    <label style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                      सूचनेचा मजकूर (Marquee Text):
                    </label>
                    <textarea
                      name="marqueeText"
                      defaultValue={content.marqueeText || ''}
                      placeholder="उदा. आपुलकी चॅरिटेबल ट्रस्टच्या वतीने रविवार, २५ मार्च रोजी भव्य रक्तदान शिबिराचे आयोजन करण्यात आले आहे. सर्व नागरिकांनी आवर्जून उपस्थित राहावे. 🙏"
                      style={{ minHeight: 70, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" type="submit">
                      सूचना सेव्ह करा
                    </button>
                    {content.marqueeText && (
                      <button
                        className="btn btn-danger"
                        type="submit"
                        name="marqueeText"
                        value=""
                        title="पट्टी बंद करा व मजकूर काढून टाका"
                      >
                        पट्टी बंद करा / मजकूर हटवा
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>मुख्य "हिरो सेक्शन" पार्श्वभूमी (Background) फोटो</h2>
                <p style={{ fontSize: 12.5, color: '#555', marginBottom: 18 }}>
                  होमपेजवरील मुख्य बॅनर/हिरो विभागाच्या मागे दिसणारा पार्श्वभूमी फोटो.
                </p>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.heroBgImage || 'assets/HERO SECTION IMAGE.jpg'}
                    alt="हिरो बॅकग्राऊंड"
                    style={{ width: 220, height: 110, objectFit: 'cover', borderRadius: 12, background: '#eee', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <SingleImageForm field="heroBgImage" tab="content" />
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>"आपुलकी बद्दल" विभागातील फोटो</h2>
                <p style={{ fontSize: 12.5, color: '#555', marginBottom: 18 }}>
                  होमपेजवरील "आपुलकी बद्दल" विभागात दिसणारा मुख्य फोटो.
                </p>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 18 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.aboutImage}
                    alt=""
                    style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 12, background: '#eee', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <SingleImageForm field="aboutImage" tab="content" />
                  </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #ececf1', margin: '18px 0' }} />
                <form method="POST" action="/api/admin/actions">
                  <input type="hidden" name="action" value="update_about_text" />
                  <input type="hidden" name="tab" value="content" />
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <div className="field" style={{ flex: 1, minWidth: 200 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 600 }}>नाव</label>
                      <input type="text" name="aboutImageName" defaultValue={content.aboutImageName} />
                    </div>
                    <div className="field" style={{ flex: 1, minWidth: 200 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 600 }}>हुद्दा</label>
                      <input type="text" name="aboutImageRole" defaultValue={content.aboutImageRole} />
                    </div>
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }}>
                    सेव्ह करा
                  </button>
                </form>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>"आमचे कार्यकर्ते" विभागातील फोटो</h2>
                <p style={{ fontSize: 12.5, color: '#555', marginBottom: 18 }}>
                  होमपेजवरील "आमचे कार्यकर्ते" विभागात दिसणारा फोटो.
                </p>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.karyakarteImage}
                    alt=""
                    style={{ width: 220, height: 100, objectFit: 'cover', borderRadius: 12, background: '#eee', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <SingleImageForm field="karyakarteImage" tab="content" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'achievements' && (
            <>
              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>नवीन गौरव / मान्यता जोडा</h2>
                <p style={{ fontSize: 12.5, color: '#555', marginBottom: 18 }}>
                  इथे जोडलेली नोंद "आपुलकीचे यश आणि मान्यता" कॅरोसेलमध्ये आलटून पालटून दाखवली जाईल. फोटो, पिल टॅग (उदा. पुरस्कार/वृत्तपत्र नाव), मोठे केशरी शीर्षक आणि खाली दिसणारा सविस्तर परिच्छेद प्रविष्ट करा.
                </p>
                <AddMediaForm kind="achievement" tab="achievements" />
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>सध्याच्या नोंदी ({achievements.length})</h2>
                {achievements.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#555', padding: '16px 0', textAlign: 'center' }}>
                    अजून कोणतीही अतिरिक्त नोंद जोडलेली नाही.
                  </div>
                ) : (
                  <div className="grid">
                    {achievements.map((item) => (
                      <div className="item-card" key={item.id}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="thumb" src={item.image} alt="" />
                        <div className="body">
                          <form method="POST" action="/api/admin/actions">
                            <input type="hidden" name="action" value="edit_achievement" />
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="tab" value="achievements" />

                            <div style={{ marginBottom: 6 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 2 }}>
                                पिल / बॅज मजकूर
                              </label>
                              <input
                                type="text"
                                name="tag"
                                defaultValue={item.tag || 'सन्मान व गौरव'}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e2e2e6', fontSize: 12, boxSizing: 'border-box' }}
                              />
                            </div>

                            <div style={{ marginBottom: 6 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 2 }}>
                                शीर्षक (मोठे केशरी अक्षरे) *
                              </label>
                              <input
                                type="text"
                                name="title"
                                defaultValue={item.title || item.caption || ''}
                                required
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e2e2e6', fontSize: 12, fontWeight: 600, boxSizing: 'border-box' }}
                              />
                            </div>

                            <div style={{ marginBottom: 6 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 2 }}>
                                सविस्तर परिच्छेद
                              </label>
                              <textarea
                                name="description"
                                defaultValue={item.description || ''}
                                placeholder="सविस्तर परिच्छेद..."
                                style={{ width: '100%', minHeight: 52, resize: 'vertical', padding: '6px 8px', borderRadius: 6, border: '1.5px solid #e2e2e6', fontSize: 12, boxSizing: 'border-box' }}
                              />
                            </div>

                            <button className="btn btn-outline" type="submit" style={{ width: '100%', marginTop: 2 }}>
                              सेव्ह करा
                            </button>
                          </form>
                          <form method="POST" action="/api/admin/actions">
                            <input type="hidden" name="action" value="delete_achievement" />
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="tab" value="achievements" />
                            <button className="btn btn-danger" type="submit" style={{ width: '100%', marginTop: 4 }}>
                              काढा
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'video' && (
            <>
              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>नवीन व्हिडिओ जोडा</h2>
                <p style={{ fontSize: 12.5, color: '#555', marginBottom: 18 }}>
                  व्हिडिओ अपलोड करा (MP4 / WEBM / MOV) आणि कॅप्शन लिहा.
                </p>
                <AddMediaForm kind="video" tab="video" />
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>सध्याचे व्हिडिओ ({videos.length})</h2>
                {videos.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#555', padding: '16px 0', textAlign: 'center' }}>
                    अजून कोणताही व्हिडिओ जोडलेला नाही.
                  </div>
                ) : (
                  <div className="grid">
                    {videos.map((item) => (
                      <div className="item-card" key={item.id}>
                        <video className="thumb" src={item.video} controls preload="metadata" />
                        <div className="body">
                          <form method="POST" action="/api/admin/actions">
                            <input type="hidden" name="action" value="edit_video" />
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="tab" value="video" />
                            <textarea
                              name="caption"
                              defaultValue={item.caption}
                              style={{ minHeight: 44, resize: 'vertical' }}
                            />
                            <button className="btn btn-outline" type="submit" style={{ width: '100%', marginTop: 6 }}>
                              सेव्ह करा
                            </button>
                          </form>
                          <form method="POST" action="/api/admin/actions">
                            <input type="hidden" name="action" value="delete_video" />
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="tab" value="video" />
                            <button className="btn btn-danger" type="submit" style={{ width: '100%', marginTop: 6 }}>
                              काढा
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'account' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', maxWidth: 420 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>पासवर्ड बदला</h2>
              <p style={{ fontSize: 12.5, color: '#555', marginBottom: 18 }}>नवीन पासवर्ड किमान ८ अक्षरांचा असावा.</p>
              <form method="POST" action="/api/admin/actions">
                <input type="hidden" name="action" value="change_password" />
                <input type="hidden" name="tab" value="account" />
                <div className="field" style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600 }}>सध्याचा पासवर्ड</label>
                  <input type="password" name="current_password" required />
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600 }}>नवीन पासवर्ड</label>
                  <input type="password" name="new_password" required minLength={8} />
                </div>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600 }}>नवीन पासवर्ड पुन्हा टाका</label>
                  <input type="password" name="confirm_password" required minLength={8} />
                </div>
                <button className="btn btn-primary" type="submit">
                  पासवर्ड अपडेट करा
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
