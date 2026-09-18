import { useContext, useState } from 'react';
import { AppDataContext } from '../../context/AppDataContext';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function PropertyCard({ p }) {
  return (
    <Link to={`/kannur/${p.type.toLowerCase()}/${p.id}`} className="pcard">
      <div className="pc-media">
        <span className={`pc-tag ${p.purpose === 'Sale' ? 'sale' : 'rent'}`}>For {p.purpose.toLowerCase()}</span>
        <div className="pc-track">
          <img src={p.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={p.title} />
        </div>
      </div>
      <div className="pc-body">
        <div className="pc-top">
          <div className="pc-title">{p.title}</div>
          <span className={`badge-status ${p.status === 'Available' ? 'avail' : 'nego'}`}>{p.status}</span>
        </div>
        <div className="pc-loc">{p.loc}, Kannur</div>
        <div className="pc-meta">
          {[p.type, p.land || p.area, p.beds ? p.beds + ' BHK' : null].filter(Boolean).join(' · ')}
        </div>
        <div className="pc-price">₹{p.price} L {p.nego && <small>· Negotiable</small>}</div>
      </div>
    </Link>
  );
}

export default function PropertyDetail() {
  const { props, user, wishlist, toggleWishlist, addLead, setShowAuthModal } = useContext(AppDataContext);
  const { slug } = useParams();
  
  const pId = parseInt(slug);
  const p = props.find(prop => prop.id === pId);
  const [lightbox, setLightbox] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  // Site Visit Modal State
  const [visitModal, setVisitModal] = useState(false);
  const [visitStep, setVisitStep] = useState(0); // 0: form, 1: success
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('Morning (10 AM - 12 PM)');

  if (!p) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Property not found.</div>;
  }

  const similar = props.filter(prop => prop.id !== pId && prop.type === p.type).slice(0, 3);
  const inWishlist = wishlist.includes(pId);

  const openLightbox = (idx) => {
    setLbIndex(idx);
    setLightbox(true);
  };

  const handleVisitSubmit = () => {
    if (user) {
      addLead({
        name: user.name,
        phone: user.phone,
        loc: user.loc,
        src: 'Site visit request',
        props: [p.title]
      });
    } else {
      // If not logged in, just send a generic lead with whatever we can, or prompt login.
      // Since they should be gated, they are likely logged in if they click it, but just in case:
      addLead({
        name: 'Guest User',
        phone: 'Unknown',
        loc: 'Unknown',
        src: 'Site visit request',
        props: [p.title]
      });
    }
    setVisitStep(1);
  };

  return (
    <>
      <Helmet>
        <title>{p.title} | KARMA Real Estate Kannur</title>
        <meta name="description" content={`View details for ${p.title} in ${p.loc}, Kannur. ₹${p.price} Lakhs. ${p.beds ? p.beds+' BHK' : ''} ${p.type}.`} />
      </Helmet>
      <section className="detail">
      <Link to="/results" className="d-back">← Back to search results</Link>
      <div className="d-headrow">
        <div className="d-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ marginBottom: 0 }}>{p.title}</h1>
            <span className={`badge-status ${p.status === 'Available' ? 'avail' : 'nego'}`}>{p.purpose}</span>
          </div>
          <div className="d-sub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{p.loc}, Kannur</span>
          </div>
        </div>
        <div className="d-actions">
          <button className="btn btn-outline" style={{padding: '8px 12px'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share
          </button>
          <button className="btn btn-outline" style={{padding: '8px 12px', color: inWishlist ? 'red' : 'inherit'}} onClick={() => toggleWishlist(pId)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? "red" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {inWishlist ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      
      <div className="gallery">
        <div className="g-main-wrap" onClick={() => openLightbox(0)}>
          <img className="g-main" src={p.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt="Property main" />
          <div className="g-overlay">View Gallery</div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="g-side-img" onClick={() => openLightbox(i)} style={{ borderRadius: i === 2 ? '0 20px 0 0' : i === 4 ? '0 0 20px 0' : '0' }}>
            {p.imgs?.[i] ? (
              <img src={p.imgs[i]} alt={`Gallery ${i+1}`} />
            ) : (
              <div style={{ background: '#f0f2f5', width: '100%', height: '100%' }}></div>
            )}
            {i === 4 && p.imgs?.length > 5 && (
              <div className="g-more">+{p.imgs.length - 5} photos</div>
            )}
          </div>
        ))}
      </div>

      <div className="d-cols">
        <div style={{ position: 'relative', overflow: !user ? 'hidden' : 'visible', maxHeight: !user ? '520px' : 'none' }}>
          
          <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 12, height: 12, background: 'var(--blue)', borderRadius: 2 }}></div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>For {p.purpose.toLowerCase()}</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>
              ₹{p.price} L
            </div>
            <div style={{ display: 'flex', gap: 24, color: 'var(--ink-2)', fontSize: 15, fontWeight: 500 }}>
              {p.beds && <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v8h18V2H3zm18 10H3v10h18V12z"/><line x1="8" y1="12" x2="8" y2="22"/><line x1="16" y1="12" x2="16" y2="22"/></svg>
                {p.beds} Bed
              </div>}
              {p.baths && <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M8 2v3"/><path d="M16 2v3"/></svg>
                {p.baths} Bath
              </div>}
              <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {p.area || p.land}
              </div>
            </div>
          </div>
          
          <div className="d-sec" style={!user ? { filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
            <h3>Overview</h3>
            <p className="d-desc">{p.desc}</p>
          </div>

          <div className="d-sec" style={!user ? { filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
            <h3>Highlights</h3>
            <div className="spec-grid hl-grid" style={{ background: 'var(--bg-soft)', padding: 24, borderRadius: 16, gap: '24px 16px' }}>
              <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <div className="spec-txt"><b style={{fontSize: 12, color: 'var(--ink-2)'}}>Area</b><span style={{fontSize: 14}}>{p.area || p.land}</span></div>
              </div>
              {p.beds && (
                <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2v8h18V2H3zm18 10H3v10h18V12z"/><line x1="8" y1="12" x2="8" y2="22"/><line x1="16" y1="12" x2="16" y2="22"/></svg>
                  <div className="spec-txt"><b style={{fontSize: 12, color: 'var(--ink-2)'}}>Bedrooms</b><span style={{fontSize: 14}}>{p.beds} BHK</span></div>
                </div>
              )}
              <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <div className="spec-txt"><b style={{fontSize: 12, color: 'var(--ink-2)'}}>Type</b><span style={{fontSize: 14}}>{p.type}</span></div>
              </div>
              <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div className="spec-txt"><b style={{fontSize: 12, color: 'var(--ink-2)'}}>Status</b><span style={{fontSize: 14}}>{p.status}</span></div>
              </div>
              <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <div className="spec-txt"><b style={{fontSize: 12, color: 'var(--ink-2)'}}>Listed</b><span style={{fontSize: 14}}>{p.listed}</span></div>
              </div>
            </div>
          </div>

          {(p.pros || p.cons) && (
            <div className="d-sec" style={!user ? { filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
              <h3>The Honest View (Verified by KARMA)</h3>
              <div className="pros-cons">
                {p.pros && (
                  <div className="pc-col pros">
                    <h4>What we love</h4>
                    <ul>{p.pros.map((pro, i) => <li key={i}>{pro}</li>)}</ul>
                  </div>
                )}
                {p.cons && (
                  <div className="pc-col cons">
                    <h4>Keep in mind</h4>
                    <ul>{p.cons.map((con, i) => <li key={i}>{con}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {p.tour && (
            <div className="d-sec">
              <h3>Virtual Tour</h3>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                <iframe 
                  src={p.tour} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Virtual Tour"
                />
              </div>
            </div>
          )}

          <div className="d-sec">
            <h3>Location</h3>
            <div className="mini-map" style={{ background: '#e5e7eb' }}>
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0, position: 'absolute', inset: 0 }}
                src={`https://maps.google.com/maps?q=${p.lat},${p.lng}&hl=en&z=14&output=embed`}
                allowFullScreen
                title={`Map of ${p.loc}`}
              ></iframe>
            </div>
          </div>

          {similar.length > 0 && (
            <div className="d-sec">
              <h3>Similar Properties</h3>
              <div className="similar-grid">
                {similar.map(sp => <PropertyCard key={sp.id} p={sp} />)}
              </div>
            </div>
          )}

          {/* Auth Gate Overlay */}
          {!user && (
            <div className="auth-gate" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 20%, #fff 100%)' }}>
              <div className="bg-white p-10 rounded-[32px] text-center max-w-lg w-[calc(100%-32px)] mx-auto mb-8 border border-gray-100 shadow-[0_-8px_40px_rgba(0,0,0,0.06)] flex flex-col items-center">
                <div className="w-16 h-16 bg-[#eaf3ef] text-[#0a523b] rounded-full flex items-center justify-center mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Unlock Full Details</h3>
                <p className="text-gray-500 text-[15px] mb-8 leading-relaxed max-w-sm">
                  Verify your number once to view honest pros/cons, location map, and full property specifications.
                </p>
                <button className="btn-primary w-full max-w-[280px]" onClick={() => setShowAuthModal(true)}>
                  Verify Number to View
                </button>
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="d-sidebar">
            <div className="cta-card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 700 }}>Request a tour</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 20 }}>Get a tour of the property as per your time.</p>
              
              {visitStep === 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div className="fld" style={{ marginBottom: 0 }}>
                      <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ padding: '10px 12px', fontSize: 13 }} />
                    </div>
                    <div className="fld" style={{ marginBottom: 0 }}>
                      <div className="select-wrap">
                        <select value={visitTime} onChange={e => setVisitTime(e.target.value)} style={{ padding: '10px 12px', fontSize: 13 }}>
                          <option>10:00 AM</option>
                          <option>12:00 PM</option>
                          <option>02:00 PM</option>
                          <option>04:00 PM</option>
                        </select>
                        <svg className="sel-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', marginBottom: 12 }} disabled={!visitDate} onClick={handleVisitSubmit}>
                    Schedule a Tour
                  </button>
                  <button className="btn btn-outline" style={{ width: '100%' }}>
                    Request Info
                  </button>
                </>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0' }}>Request Sent!</h4>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>Our team will contact you shortly to confirm your visit.</p>
                </div>
              )}
            </div>

            <div className="cta-card">
              <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 700 }}>KARMA Agent</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 20 }}>Get an insight of the house from our verified agent.</p>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--bg-soft)', flexShrink: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200)', backgroundSize: 'cover' }}></div>
                <div>
                  <b style={{ display: 'block', fontSize: 15, marginBottom: 4 }}>KARMA Official</b>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Verified Agency • Kannur</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 11, background: 'var(--blue)', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Top Rated</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13, marginBottom: 20 }}>
                <div style={{ color: 'var(--ink-2)', marginBottom: 4 }}>Contact</div>
                <div style={{ fontWeight: 600 }}>+91 98460 12345</div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <a href="tel:+919995797450" className="btn-primary" style={{ flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 8}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Call
                </a>
                <a href={`https://wa.me/919995797450?text=Hi, I'm interested in the property: ${p.title} (https://karma.com/kannur/${p.type.toLowerCase()}/${p.id})`} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', background: '#25D366', borderColor: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: 8}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      {user && (
        <div className="d-mobile-cta">
          <a href="tel:+919995797450" className="btn-primary" style={{flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 13}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 6}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call
          </a>
          <a href={`https://wa.me/919995797450?text=Hi, I'm interested in the property: ${p.title} (https://karma.com/kannur/${p.type.toLowerCase()}/${p.id})`} target="_blank" rel="noreferrer" className="btn-primary" style={{flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 13, background: '#25D366', borderColor: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.2)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: 6}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            WhatsApp
          </a>
          <button className="btn-primary" style={{flex: 1.2, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 13}} onClick={() => setVisitModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 6}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Tour
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && p.imgs && (
        <div className="lightbox">
          <button className="lb-close" onClick={() => setLightbox(false)}>✕</button>
          <div className="lb-img-wrap">
            <img src={p.imgs[lbIndex]} alt="Gallery view" />
          </div>
          {p.imgs.length > 1 && (
            <div className="lb-nav">
              <button onClick={() => setLbIndex((lbIndex - 1 + p.imgs.length) % p.imgs.length)}>←</button>
              <div className="lb-thumbs">
                {p.imgs.map((img, i) => (
                  <img key={i} src={img} className={i === lbIndex ? 'active' : ''} onClick={() => setLbIndex(i)} alt="Thumb" />
                ))}
              </div>
              <button onClick={() => setLbIndex((lbIndex + 1) % p.imgs.length)}>→</button>
            </div>
          )}
        </div>
      )}
    </section>
    </>
  );
}
