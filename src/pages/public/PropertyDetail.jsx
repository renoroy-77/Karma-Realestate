import { useContext, useState, useEffect, useRef } from 'react';
import { AppDataContext, mapBackendPropToFrontend, formatIndianPrice } from '../../context/AppDataContext';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/api';

function CardCarousel({ children }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amt = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amt : amt, behavior: 'smooth' });
    }
  };

  return (
    <div className="carousel-wrap" style={{ position: 'relative' }}>
      <button 
        className="c-nav left" 
        onClick={() => scroll('left')} 
        aria-label="Previous"
        style={{
          position: 'absolute',
          left: -16,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid var(--line)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.2s'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <div 
        ref={scrollRef} 
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          scrollBehavior: 'smooth',
          padding: '8px 4px 18px'
        }}
      >
        {children}
      </div>

      <button 
        className="c-nav right" 
        onClick={() => scroll('right')} 
        aria-label="Next"
        style={{
          position: 'absolute',
          right: -16,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid var(--line)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.2s'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  );
}

function PropertyCard({ p }) {
  const { wishlist, toggleWishlist, user, setShowAuthModal } = useContext(AppDataContext);
  const inWishlist = wishlist.includes(p.id);
  const propertyPath = `/kannur/${(p.type || 'house').toLowerCase()}/${p.slug || p.id}`;

  return (
    <Link 
      to={propertyPath}
      className="similar-card-hover"
      style={{ 
        flex: '0 0 280px', 
        scrollSnapAlign: 'start',
        background: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid var(--line)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer'
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden', background: '#f1f5f9' }}>
        <img 
          src={p.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} 
          alt={p.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
        />
        <span 
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(4px)',
            color: 'var(--ink)',
            padding: '4px 10px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          For {p.purpose?.toLowerCase() || 'sale'}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) {
              setShowAuthModal(true);
            } else {
              toggleWishlist(p.id);
            }
          }}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255,255,255,0.92)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            zIndex: 2
          }}
        >
          <svg viewBox="0 0 32 32" width="16" height="16" xmlns="http://www.w3.org/2000/svg" style={{ fill: inWishlist ? '#ef4444' : 'rgba(0,0,0,0.35)', stroke: inWishlist ? '#ef4444' : '#fff', strokeWidth: 2 }}>
            <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94c-2.8 0-5.46 1.4-6.98 3.73C14.54 5.4 11.88 4 9.08 4 5.2 4 2 7.15 2 11.08c0 7 7 12.27 14 17z"></path>
          </svg>
        </button>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {p.type}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4 }}>
            {p.status || 'Available'}
          </span>
        </div>

        <div 
          style={{ 
            fontSize: 15, 
            fontWeight: 700, 
            color: 'var(--ink)', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            marginTop: 2
          }}
          title={p.title}
        >
          {p.title}
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
          📍 {p.loc}, Kannur
        </div>

        <div style={{ fontSize: 12.5, color: '#64748b' }}>
          {[p.area, p.land, p.beds ? `${p.beds} BHK` : null, p.baths ? `${p.baths} Bath` : null].filter(Boolean).join(' · ')}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
            {p.priceFormatted || formatIndianPrice(p.price, p.purpose)}
          </span>
          {p.nego && <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Negotiable</span>}
        </div>
      </div>
    </Link>
  );
}

function formatEmbedUrl(url) {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/watch')) {
      const v = new URL(url).searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      if (id && !url.includes('player.vimeo.com')) return `https://player.vimeo.com/video/${id}`;
    }
  } catch (e) {}
  return url;
}

export default function PropertyDetail() {
  const { props, user, wishlist, toggleWishlist, addLead, setShowAuthModal } = useContext(AppDataContext);
  const { slug } = useParams();
  
  const [propData, setPropData] = useState(null);
  const [similarProps, setSimilarProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  // Site Visit Modal State
  const [visitStep, setVisitStep] = useState(0); // 0: form, 1: success
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('Morning (10 AM - 12 PM)');

  // Initial optimistic match from context
  const contextProp = props.find(prop => prop.slug === slug || String(prop.id) === String(slug));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setPropData(null);
    let isMounted = true;
    setLoading(!contextProp);

    api.get(`/properties/${slug}`)
      .then(res => {
        if (res.data.success && isMounted) {
          setPropData(mapBackendPropToFrontend(res.data.data));
        }
      })
      .catch(err => {
        console.error('Error fetching property by slug', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    api.get(`/properties/${slug}/similar`)
      .then(res => {
        if (res.data.success && isMounted) {
          setSimilarProps(res.data.data.map(mapBackendPropToFrontend));
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [slug, user]);

  const isPropMatch = propData && (propData.slug === slug || String(propData.id) === String(slug));
  const p = isPropMatch ? propData : contextProp;

  if (!p && loading) {
    return (
      <div style={{ padding: '120px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>Loading property details...</div>
      </div>
    );
  }

  if (!p) {
    return (
      <div style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: 24, marginBottom: 8 }}>Property not found</h3>
        <p style={{ color: 'var(--ink-2)', marginBottom: 24 }}>The listing you are looking for might have been sold or delisted.</p>
        <Link to="/results" className="btn-primary">Browse available listings</Link>
      </div>
    );
  }

  const similar = (similarProps.length > 0 ? similarProps : props)
    .filter(prop => prop && p && String(prop.id) !== String(p.id) && prop.slug !== p.slug);

  const inWishlist = wishlist.includes(p.id);

  const openLightbox = (idx) => {
    setLbIndex(idx);
    setLightbox(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: p.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleVisitSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      await api.post('/site-visit', {
        property_id: p.id,
        visitor_name: user?.name || 'Interested Buyer',
        visitor_email: user?.email || (user?.phone ? `${user.phone}@karmarealestate.in` : 'buyer@karmarealestate.in'),
        visitor_phone: user?.phone || '9999999999',
        preferred_date: visitDate,
        preferred_time_slot: visitTime,
        notes: `Tour booked from website for ${p.title}`
      });
    } catch (err) {
      console.error('Site visit API submission error', err);
    }

    addLead({
      name: user?.name || 'Interested Buyer',
      phone: user?.phone || 'Unknown',
      loc: user?.loc || 'Kannur',
      src: 'Site visit request',
      props: [p.title]
    });
    setVisitStep(1);
  };

  // WhatsApp & Call number sanitizer (Ensures 91 prefix for Indian numbers)
  const rawPhone = String(p.ownerPhone || '9995797450');
  const digitsOnly = rawPhone.replace(/[^0-9]/g, '');
  const waNumber = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
  const callNumber = digitsOnly.length === 10 ? `+91${digitsOnly}` : (digitsOnly.startsWith('91') ? `+${digitsOnly}` : `+${digitsOnly}`);
  const maskedPhone = digitsOnly.length >= 10
    ? `+91 ${digitsOnly.slice(0, 2)}••• •••${digitsOnly.slice(-2)}`
    : '+91 98••• •••34';
  const shareText = `Hi, I'm interested in the property: ${p.title} (${window.location.href})`;

  return (
    <>
      <Helmet>
        <title>{p.title} | KARMA Real Estate Kannur</title>
        <meta 
          name="description" 
          content={`View details for ${p.title} in ${p.loc}, Kannur. ${p.priceFormatted || formatIndianPrice(p.price, p.purpose)}. ${p.beds ? p.beds + ' BHK ' : ''}${p.baths ? p.baths + ' Bath ' : ''}${p.type}.`} 
        />
      </Helmet>

      <section className="detail">
        <Link to="/results" className="d-back">← Back to search results</Link>
        
        {/* Header Row: Title, Badges, Price, Actions */}
        <div className="d-headrow">
          <div className="d-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <h1 style={{ marginBottom: 0 }}>{p.title}</h1>
              <span className={`badge-status ${p.status === 'Available' ? 'avail' : 'nego'}`}>{p.status || 'Available'}</span>
              <span className="badge-status" style={{ background: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}>For {p.purpose?.toLowerCase()}</span>
            </div>
            <div className="d-sub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{p.loc}, Kannur, Kerala</span>
              {p.cls && <span style={{ color: '#64748b' }}>· {p.cls}</span>}
            </div>
          </div>
          <div className="d-actions">
            <button className="btn btn-outline" style={{ padding: '8px 14px' }} onClick={handleShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Share
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 14px' }} 
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else if (p.brochureUrl) {
                  window.open(p.brochureUrl, '_blank');
                } else {
                  window.open(`/admin/properties/${p.id}/pdf`, '_blank');
                }
              }}
              title={p.brochureUrl ? "Download Official PDF Brochure" : "Download branded A4 PDF brochure"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M12 18v-6m0 6-2.5-2.5M12 18l2.5-2.5"/></svg>
              Brochure
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 14px', color: inWishlist ? '#ef4444' : 'inherit', borderColor: inWishlist ? '#ef4444' : 'var(--line)' }} 
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  toggleWishlist(p.id);
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {inWishlist ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
        
        {/* Responsive, Dynamic Adaptive Gallery with Single Cover Visible & OTP Locked Side Photos */}
        {(() => {
          const galleryImgs = (p.imgs && p.imgs.length > 0) 
            ? p.imgs 
            : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'];
          const total = galleryImgs.length;
          const isLocked = !user;

          const renderSidePhoto = (imgUrl, index, isPrimaryLock = false, extraStyle = {}) => (
            <div
              className="g-side-img"
              onClick={() => {
                if (isLocked) {
                  setShowAuthModal(true);
                } else {
                  openLightbox(index);
                }
              }}
              style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', ...extraStyle }}
            >
              <img
                src={imgUrl}
                alt={`Gallery ${index + 1}`}
                style={isLocked ? { width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(5px) brightness(0.75)', transform: 'scale(1.08)' } : { width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {isLocked ? (
                isPrimaryLock ? (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(10, 82, 59, 0.88), rgba(16, 185, 129, 0.88))',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: '#fff',
                    padding: 12,
                    textAlign: 'center',
                    zIndex: 2
                  }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'grid', placeItems: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Unlock Gallery</span>
                    <span style={{ fontSize: 11, opacity: 0.9 }}>+{Math.max(1, total - 1)} photo{total - 1 > 1 ? 's' : ''}</span>
                  </div>
                ) : (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    zIndex: 2
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                  </div>
                )
              ) : (
                index === 4 && total > 5 && (
                  <div className="g-more">+{total - 5} photos</div>
                )
              )}
            </div>
          );

          if (total === 1) {
            return (
              <div 
                style={{ 
                  height: 480, 
                  borderRadius: 20, 
                  overflow: 'hidden', 
                  position: 'relative', 
                  cursor: 'pointer', 
                  marginBottom: 48,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                }}
                onClick={() => openLightbox(0)}
              >
                <img src={galleryImgs[0]} alt="Property cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="g-overlay" style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 16, fontWeight: 600, opacity: 0, transition: 'opacity 0.2s'
                }}>
                  View Photo
                </div>
              </div>
            );
          }

          if (total === 2) {
            return (
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.2fr 1fr', 
                  gap: 12, 
                  height: 480, 
                  borderRadius: 20, 
                  overflow: 'hidden', 
                  marginBottom: 48 
                }}
              >
                <div className="g-main-wrap" onClick={() => openLightbox(0)}>
                  <img className="g-main" src={galleryImgs[0]} alt="Property cover" />
                  <div className="g-overlay">View Photo</div>
                </div>
                {renderSidePhoto(galleryImgs[1], 1, true)}
              </div>
            );
          }

          if (total === 3) {
            return (
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.4fr 1fr', 
                  gridTemplateRows: '1fr 1fr', 
                  gap: 12, 
                  height: 480, 
                  borderRadius: 20, 
                  overflow: 'hidden', 
                  marginBottom: 48 
                }}
              >
                <div className="g-main-wrap" onClick={() => openLightbox(0)} style={{ gridRow: '1 / 3' }}>
                  <img className="g-main" src={galleryImgs[0]} alt="Property cover" />
                  <div className="g-overlay">View Photo</div>
                </div>
                {renderSidePhoto(galleryImgs[1], 1, false)}
                {renderSidePhoto(galleryImgs[2], 2, true)}
              </div>
            );
          }

          if (total === 4) {
            return (
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.4fr 1fr 1fr', 
                  gridTemplateRows: '1fr 1fr', 
                  gap: 12, 
                  height: 480, 
                  borderRadius: 20, 
                  overflow: 'hidden', 
                  marginBottom: 48 
                }}
              >
                <div className="g-main-wrap" onClick={() => openLightbox(0)} style={{ gridRow: '1 / 3' }}>
                  <img className="g-main" src={galleryImgs[0]} alt="Property cover" />
                  <div className="g-overlay">View Photo</div>
                </div>
                {renderSidePhoto(galleryImgs[1], 1, false)}
                {renderSidePhoto(galleryImgs[2], 2, false)}
                {renderSidePhoto(galleryImgs[3], 3, true, { gridColumn: '2 / 4' })}
              </div>
            );
          }

          // 5 or more photos
          return (
            <div className="gallery">
              <div className="g-main-wrap" onClick={() => openLightbox(0)}>
                <img className="g-main" src={galleryImgs[0]} alt="Property main cover" />
                <div className="g-overlay">View Photo</div>
              </div>
              {[1, 2, 3, 4].map((i) => renderSidePhoto(galleryImgs[i], i, i === 4))}
            </div>
          );
        })()}

        {/* Two-Column Layout: Main Content (Left) & Sticky Sidebar (Right) */}
        <div className="d-cols">
          
          {/* Main Left Column */}
          <div>
            
            {/* Price & Quick Details Strip (Always visible before OTP) */}
            <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, background: 'var(--blue)', borderRadius: 2 }}></div>
                <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-2)' }}>
                  For {p.purpose?.toLowerCase()}
                </span>
                {p.nego && (
                  <span style={{ fontSize: 12, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                    🏷️ Price Negotiable
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--ink)', marginBottom: 18, letterSpacing: '-0.02em' }}>
                {p.priceFormatted || formatIndianPrice(p.price, p.purpose)}
              </div>

              <div style={{ display: 'flex', gap: 20, color: 'var(--ink-2)', fontSize: 15, fontWeight: 500, flexWrap: 'wrap' }}>
                {p.beds && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v8h18V2H3zm18 10H3v10h18V12z"/><line x1="8" y1="12" x2="8" y2="22"/><line x1="16" y1="12" x2="16" y2="22"/></svg>
                    <span>{p.beds} Bed</span>
                  </div>
                )}
                {p.baths && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M8 2v3"/><path d="M16 2v3"/></svg>
                    <span>{p.baths} Bath</span>
                  </div>
                )}
                {p.area && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    <span>{p.area}</span>
                  </div>
                )}
                {p.land && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/></svg>
                    <span>{p.land}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  <span>{p.type}</span>
                </div>
              </div>
            </div>
            
            {/* Overview Section: Fully visible before OTP as per proposal */}
            <div className="d-sec">
              <h3>Overview</h3>
              <p className="d-desc" style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: 15.5, color: '#334155' }}>
                {p.desc || 'No description provided for this listing.'}
              </p>
            </div>

            {/* GATED SECTIONS: Highlights, Amenities, The Honest View, Virtual Tour, Exact Map */}
            {!user ? (
              /* Before OTP: Beautiful Glassmorphism Unlock Gate */
              <div style={{ position: 'relative', marginTop: 24, borderRadius: 24, overflow: 'hidden' }}>
                
                {/* Teaser Preview with soft blur */}
                <div 
                  style={{ 
                    filter: 'blur(7px)', 
                    opacity: 0.4, 
                    userSelect: 'none', 
                    pointerEvents: 'none', 
                    maxHeight: 520, 
                    overflow: 'hidden' 
                  }}
                  aria-hidden="true"
                >
                  <div className="d-sec">
                    <h3>Highlights</h3>
                    <div className="spec-grid hl-grid" style={{ background: 'var(--bg-soft)', padding: 24, borderRadius: 16, gap: '20px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <div className="spec-txt"><b>Land Area</b><span>{p.land || '10 Cents'}</span></div>
                      </div>
                      <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <div className="spec-txt"><b>Type</b><span>{p.type}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="d-sec">
                    <h3>The Honest View (Verified by KARMA)</h3>
                    <div className="pros-cons">
                      <div className="pc-col pros">
                        <h4>What we love</h4>
                        <ul><li>Square-shaped vaastu plot with wide internal access</li></ul>
                      </div>
                      <div className="pc-col cons">
                        <h4>Keep in mind</h4>
                        <ul><li>Fixed rate non-negotiable pricing</li></ul>
                      </div>
                    </div>
                  </div>
                  <div className="d-sec">
                    <h3>Location & Landmarks</h3>
                    <div style={{ height: 240, background: '#cbd5e1', borderRadius: 16 }}></div>
                  </div>
                </div>

                {/* Floating Glassmorphism Unlock Card */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 16px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.98) 60%, #fff 100%)',
                  zIndex: 10
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 24,
                    padding: '36px 32px',
                    maxWidth: 480,
                    width: '100%',
                    boxShadow: '0 20px 50px -10px rgba(10, 82, 59, 0.18), 0 0 0 1px rgba(10, 82, 59, 0.08)',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, rgba(10, 82, 59, 0.12), rgba(16, 185, 129, 0.18))',
                      color: 'var(--blue)',
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 4px 12px rgba(10, 82, 59, 0.1)'
                    }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#065f46', padding: '4px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
                      <span>🛡️ Verified Property Intelligence</span>
                    </div>

                    <h3 style={{ fontSize: 23, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                      Unlock Full Property Details
                    </h3>

                    <p style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
                      Verify your mobile number once with free OTP to view verified specifications, pros & cons, and exact location:
                    </p>

                    <div style={{ textAlign: 'left', background: 'var(--bg-soft)', padding: '16px 20px', borderRadius: 16, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#334155' }}>
                        <span style={{ color: '#059669', fontSize: 16 }}>✓</span>
                        <span><b>The Honest View:</b> Verified Pros & Cons by KARMA</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#334155' }}>
                        <span style={{ color: '#059669', fontSize: 16 }}>✓</span>
                        <span><b>Exact Map Location:</b> GPS navigation & landmarks</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#334155' }}>
                        <span style={{ color: '#059669', fontSize: 16 }}>✓</span>
                        <span><b>Full Specifications:</b> Land survey, classification & facilities</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#334155' }}>
                        <span style={{ color: '#059669', fontSize: 16 }}>✓</span>
                        <span><b>Direct Contact:</b> Phone call & WhatsApp to verified agent</span>
                      </div>
                    </div>

                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', borderRadius: 14 }}
                      onClick={() => setShowAuthModal(true)}
                    >
                      Verify Mobile to Unlock (Instant Free OTP)
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14, fontSize: 12, color: '#94a3b8' }}>
                      <span>⚡ 10-Second OTP</span>
                      <span>•</span>
                      <span>🔒 100% Free</span>
                      <span>•</span>
                      <span>🚫 Zero Spam</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* After OTP: Full unblurred details */
              <div>
                {/* Highlights Grid */}
                <div className="d-sec">
                  <h3>Highlights</h3>
                  <div className="spec-grid hl-grid" style={{ background: 'var(--bg-soft)', padding: 24, borderRadius: 16, gap: '20px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    {p.area && (
                      <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                        <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>Building Area</b><span style={{ fontSize: 14 }}>{p.area}</span></div>
                      </div>
                    )}
                    {p.land && (
                      <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/></svg>
                        <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>Land Area</b><span style={{ fontSize: 14 }}>{p.land}</span></div>
                      </div>
                    )}
                    {p.beds && (
                      <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2v8h18V2H3zm18 10H3v10h18V12z"/><line x1="8" y1="12" x2="8" y2="22"/><line x1="16" y1="12" x2="16" y2="22"/></svg>
                        <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>Bedrooms</b><span style={{ fontSize: 14 }}>{p.beds} BHK</span></div>
                      </div>
                    )}
                    {p.baths && (
                      <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12h20"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M8 2v3"/><path d="M16 2v3"/></svg>
                        <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>Bathrooms</b><span style={{ fontSize: 14 }}>{p.baths} Bath</span></div>
                      </div>
                    )}
                    <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>Type</b><span style={{ fontSize: 14 }}>{p.type}</span></div>
                    </div>
                    <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>Status</b><span style={{ fontSize: 14 }}>{p.status}</span></div>
                    </div>
                    {p.cls && (
                      <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>Classification</b><span style={{ fontSize: 14 }}>{p.cls}</span></div>
                      </div>
                    )}
                    {p.rera && (
                      <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>RERA Number</b><span style={{ fontSize: 14 }}>✓ {p.rera}</span></div>
                      </div>
                    )}
                    <div className="spec" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <div className="spec-txt"><b style={{ fontSize: 12, color: 'var(--ink-2)' }}>Listed</b><span style={{ fontSize: 14 }}>{p.listed || '2026-09-20'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Amenities & Facilities */}
                {p.amenities && p.amenities.length > 0 && (
                  <div className="d-sec">
                    <h3>Amenities & Facilities</h3>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {p.amenities.map((amenity, i) => (
                        <div key={i} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 16px',
                          background: 'var(--bg-soft)',
                          borderRadius: 99,
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: 'var(--ink)',
                          border: '1px solid var(--line)'
                        }}>
                          <span style={{ color: '#059669', fontSize: 14 }}>✓</span>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* The Honest View (Verified by KARMA) */}
                {(p.pros?.length > 0 || p.cons?.length > 0) && (
                  <div className="d-sec">
                    <h3>The Honest View (Verified by KARMA)</h3>
                    <div className="pros-cons">
                      {p.pros && p.pros.length > 0 && (
                        <div className="pc-col pros">
                          <h4>What we love</h4>
                          <ul>{p.pros.map((pro, i) => <li key={i}>{pro}</li>)}</ul>
                        </div>
                      )}
                      {p.cons && p.cons.length > 0 && (
                        <div className="pc-col cons">
                          <h4>Keep in mind</h4>
                          <ul>{p.cons.map((con, i) => <li key={i}>{con}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Property Video Walkthrough / Virtual Tour */}
                {(p.videoUrl || p.tour) && (() => {
                  const mediaSource = p.videoUrl || p.tour;
                  const isDirectVideo = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(mediaSource) || mediaSource.includes('/storage/properties/') || mediaSource.includes('videos/');
                  const isYoutubeOrVimeo = mediaSource.includes('youtube') || mediaSource.includes('youtu.be') || mediaSource.includes('vimeo');

                  return (
                    <div className="d-sec">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ margin: 0 }}>
                          {isDirectVideo ? 'HD Video Walkthrough' : (isYoutubeOrVimeo ? 'Property Video Walkthrough' : 'Virtual Tour (360°)')}
                        </h3>
                        {isDirectVideo && (
                          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                            ✓ Direct HD Video
                          </span>
                        )}
                      </div>
                      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', background: '#000', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                        {isDirectVideo ? (
                          <video
                            controls
                            playsInline
                            preload="metadata"
                            poster={p.img || (p.imgs && p.imgs[0])}
                            src={mediaSource}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                          >
                            Your browser does not support HTML5 video.
                          </video>
                        ) : (
                          <iframe 
                            src={formatEmbedUrl(mediaSource)} 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Property Video / Virtual Tour"
                          />
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Location & Landmarks */}
                <div className="d-sec">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0' }}>Location & Landmarks</h3>
                      <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{p.loc}, Kannur District, Kerala</div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${p.lat || 11.8745},${p.lng || 75.3704}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                      >
                        <span>Open in Google Maps</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat || 11.8745},${p.lng || 75.3704}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13, color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                      >
                        <span>Get Directions</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </a>
                    </div>
                  </div>

                  {p.address && (
                    <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 12, background: 'var(--bg-soft)', padding: '10px 14px', borderRadius: 10 }}>
                      📍 <b>Exact Address:</b> {p.address}
                    </p>
                  )}

                  <div style={{ height: 320, background: '#e5e7eb', borderRadius: 16, overflow: 'hidden', border: '1.5px solid var(--line)', position: 'relative' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0, position: 'absolute', inset: 0 }}
                      src={`https://maps.google.com/maps?q=${p.lat || 11.8745},${p.lng || 75.3704}&hl=en&z=15&output=embed`}
                      allowFullScreen
                      title={`Map of ${p.title || p.loc}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Sidebar: Tour & Agent Contact */}
          <div className="d-sidebar">
            
            {/* Tour Request Card */}
            <div className="cta-card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 700 }}>Request a tour</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 20 }}>
                Get a private guided tour of the property as per your preferred schedule.
              </p>
              
              {visitStep === 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div className="fld" style={{ marginBottom: 0 }}>
                      <label>Date</label>
                      <input 
                        type="date" 
                        value={visitDate} 
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setVisitDate(e.target.value)} 
                        style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', width: '100%', boxSizing: 'border-box' }} 
                      />
                    </div>
                    <div className="fld" style={{ marginBottom: 0 }}>
                      <label>Time</label>
                      <select 
                        value={visitTime} 
                        onChange={e => setVisitTime(e.target.value)}
                        style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {user ? (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn-primary" style={{ flex: 1, padding: '11px 0' }} onClick={handleVisitSubmit}>
                        Schedule a Tour
                      </button>
                      <button className="btn btn-outline" style={{ flex: 1, padding: '11px 0' }} onClick={handleVisitSubmit}>
                        Request Info
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} 
                      onClick={() => setShowAuthModal(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span>Verify to Schedule Tour</span>
                    </button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: 44, height: 44, background: '#E8F6EE', color: 'var(--green)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0' }}>Request Sent!</h4>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>Our verified team will contact you shortly to confirm your visit.</p>
                </div>
              )}
            </div>

            {/* Agent Contact Card */}
            <div className="cta-card">
              <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 700 }}>KARMA Agent</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 20 }}>
                Get an insight of the property from our verified local agent.
              </p>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #0a523b, #10b981)', color: '#fff', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800 }}>
                  {(p.ownerName || 'K').charAt(0).toUpperCase()}
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: 15, marginBottom: 4 }}>{p.ownerName || 'KARMA Official'}</b>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Verified Agency • {p.loc || 'Kannur'}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 11, background: 'var(--blue)', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                      Verified Agent
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13, marginBottom: 20, padding: '12px 14px', background: 'var(--bg-soft)', borderRadius: 12 }}>
                <div style={{ color: 'var(--ink-2)', marginBottom: 4 }}>Direct Contact</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', letterSpacing: user ? 'normal' : '0.05em' }}>
                  {user ? (p.ownerPhone || '+91 99957 97450') : maskedPhone}
                </div>
                {user && p.ownerEmail && <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>{p.ownerEmail}</div>}
              </div>

              {user ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  <a 
                    href={`tel:${callNumber}`} 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '11px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Call
                  </a>
                  <a 
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(shareText)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '11px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#25D366', borderColor: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.2)', textDecoration: 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '11px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 13.5 }} 
                    onClick={() => setShowAuthModal(true)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Call
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1.2, padding: '11px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 13.5, background: '#25D366', borderColor: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.2)' }} 
                    onClick={() => setShowAuthModal(true)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Properties Carousel (Rendered Full Width Down Below) */}
        {similar.length > 0 && (
          <div style={{ marginTop: 64, paddingTop: 40, borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--ink)' }}>
                  Similar Properties in Kannur
                </h2>
                <p style={{ margin: 0, fontSize: 14.5, color: 'var(--ink-2)' }}>
                  Handpicked verified listings matching {p.type?.toLowerCase()} category in {p.loc}
                </p>
              </div>
              <Link to="/results" style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>View all listings</span>
                <span>→</span>
              </Link>
            </div>

            <CardCarousel>
              {similar.map(sp => (
                <PropertyCard key={sp.id} p={sp} />
              ))}
            </CardCarousel>
          </div>
        )}

        {/* Mobile Fixed Bottom Bar */}
        <div className="d-mobile-cta">
          {user ? (
            <>
              <a 
                href={`tel:${callNumber}`} 
                className="btn-primary" 
                style={{ flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 13, textDecoration: 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call
              </a>
              <a 
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(shareText)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-primary" 
                style={{ flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 13, background: '#25D366', borderColor: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.2)', textDecoration: 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
              </a>
              <button 
                className="btn-primary" 
                style={{ flex: 1.2, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 13 }} 
                onClick={() => {
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                  handleVisitSubmit();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Tour
              </button>
            </>
          ) : (
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px 16px', fontSize: 14, fontWeight: 700, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} 
              onClick={() => setShowAuthModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Verify Mobile to Unlock Full Details & Contact</span>
            </button>
          )}
        </div>

        {/* Lightbox Modal */}
        {lightbox && p.imgs && (
          <div className="lightbox">
            <button className="lb-close" onClick={() => setLightbox(false)}>✕</button>
            <div className="lb-img-wrap">
              <img src={p.imgs[lbIndex]} alt="Gallery view" />
            </div>
            {p.imgs.length > 1 && (
              <div className="lb-nav">
                <button onClick={() => {
                  if (!user) {
                    setShowAuthModal(true);
                    return;
                  }
                  setLbIndex((lbIndex - 1 + p.imgs.length) % p.imgs.length);
                }}>←</button>
                <div className="lb-thumbs">
                  {p.imgs.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      className={i === lbIndex ? 'active' : ''} 
                      onClick={() => {
                        if (!user && i > 0) {
                          setShowAuthModal(true);
                          return;
                        }
                        setLbIndex(i);
                      }} 
                      alt="Thumb" 
                      style={!user && i > 0 ? { filter: 'blur(3px)', opacity: 0.5 } : {}}
                    />
                  ))}
                </div>
                <button onClick={() => {
                  if (!user) {
                    setShowAuthModal(true);
                    return;
                  }
                  setLbIndex((lbIndex + 1) % p.imgs.length);
                }}>→</button>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
