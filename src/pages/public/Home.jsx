import { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { AppDataContext, LOCALITY_COORDS, formatIndianPrice } from '../../context/AppDataContext';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import ClientsSectionDemo from '../../components/ui/testimonial-card';
import api from '../../lib/api';

function MapCenterController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (map && center && center.lat && center.lng) {
      map.panTo(center);
      if (zoom) {
        map.setZoom(zoom);
      }
    }
  }, [map, center, zoom]);
  return null;
}

const DEFAULT_LOC_PHOTOS = {
  'iritty': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80',
  'payyanur': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80',
  'thalassery': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=300&q=80',
  'taliparamba': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80',
  'mattannur': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=300&q=80',
  'kannur': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80',
  'payyambalam': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80',
  'kochi': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80',
  'kozhikode': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80',
  'wayanad': 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=300&q=80',
  'allepy': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80',
  'alappuzha': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80'
};

function PropertyCard({ p }) {
  const { wishlist, toggleWishlist } = useContext(AppDataContext);
  const inWishlist = wishlist.includes(p.id);
  const rating = (4.5 + ((p.id % 5) * 0.1)).toFixed(1);

  return (
    <Link to={`/kannur/${p.type.toLowerCase()}/${p.slug || p.id}`} className="pcard">
      <div className="pc-media">
        <span className="pc-tag">{p.purpose === 'Rent' ? 'For Rent' : 'Verified'}</span>
        <button
          className="pc-heart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(p.id);
          }}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '50%', padding: '6px', display: 'grid', placeItems: 'center' }}
        >
          <svg
            viewBox="0 0 32 32"
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
            style={{ fill: inWishlist ? '#ef4444' : 'rgba(0,0,0,0.4)', stroke: inWishlist ? '#ef4444' : '#fff', strokeWidth: 2 }}
          >
            <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94c-2.8 0-5.46 1.4-6.98 3.73C14.54 5.4 11.88 4 9.08 4 5.2 4 2 7.15 2 11.08c0 7 7 12.27 14 17z"></path>
          </svg>
        </button>
        <div className="pc-track">
          <img src={p.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={p.title} />
        </div>
      </div>
      <div className="pc-body">
        <div className="pc-title">{p.title || `${p.type} in ${p.loc}`}</div>
        <div className="pc-meta" style={{ color: '#717171' }}>
          <span style={{ color: '#222', fontWeight: 600 }}>{p.priceFormatted || formatIndianPrice(p.price, p.purpose)}</span> &middot; ★ {rating}
        </div>
      </div>
    </Link>
  );
}

function CardCarousel({ children }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amt = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amt : amt, behavior: 'smooth' });
    }
  };

  return (
    <div className="carousel-wrap">
      <button className="c-nav left" onClick={() => scroll('left')} aria-label="Previous">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div className="carousel" ref={scrollRef}>
        <div className="card-row">
          {children}
        </div>
      </div>
      <button className="c-nav right" onClick={() => scroll('right')} aria-label="Next">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  );
}

export default function Home() {
  const { props } = useContext(AppDataContext);
  const [activeMarker, setActiveMarker] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [activeLoc, setActiveLoc] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 11.8745, lng: 75.3704 });
  const [mapZoom, setMapZoom] = useState(9);

  const locScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [cmsSettings, setCmsSettings] = useState({
    hero_headline: 'Find Your Perfect Property in Kerala',
    hero_subheadline: 'Discover 1000+ verified properties across Kerala. Search by location, budget & lifestyle.',
    hero_announcement: '✈️ Kannur Airport Corridor Commercial Lands Available',
    popular_locations: [
      { name: 'Payyanur', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80' },
      { name: 'Thalassery', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=200&q=80' },
      { name: 'Taliparamba', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=200&q=80' },
      { name: 'Iritty', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=200&q=80' },
      { name: 'Mattannur', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=200&q=80' },
      { name: 'Kannur City', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=200&q=80' },
      { name: 'Payyambalam Beach', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80' },
      { name: 'allepy', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80' }
    ]
  });

  const checkScrollLimits = useCallback(() => {
    if (locScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = locScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  }, []);

  useEffect(() => {
    checkScrollLimits();
    const el = locScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits, { passive: true });
      window.addEventListener('resize', checkScrollLimits);
      return () => {
        el.removeEventListener('scroll', checkScrollLimits);
        window.removeEventListener('resize', checkScrollLimits);
      };
    }
  }, [cmsSettings.popular_locations, checkScrollLimits]);

  const scrollLocations = (dir) => {
    if (locScrollRef.current) {
      const scrollAmt = 240;
      locScrollRef.current.scrollBy({
        left: dir === 'left' ? -scrollAmt : scrollAmt,
        behavior: 'smooth'
      });
      setTimeout(checkScrollLimits, 320);
    }
  };

  const getMatchingCount = (locName) => {
    if (!locName) return 0;
    const lower = locName.toLowerCase().trim();
    return props.filter(p => {
      const pl = (p.loc || '').toLowerCase().trim();
      return pl.includes(lower) || lower.includes(pl);
    }).length;
  };

  const handleLocationClick = (loc) => {
    setActiveLoc(loc.name);
    if (viewMode !== 'map') setViewMode('map');

    let coords = LOCALITY_COORDS[loc.name];
    if (!coords) {
      const key = Object.keys(LOCALITY_COORDS).find(k => 
        k.toLowerCase().includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(k.toLowerCase())
      );
      if (key) coords = LOCALITY_COORDS[key];
    }
    if (!coords) {
      const pMatch = props.find(p => p.loc && p.loc.toLowerCase().includes(loc.name.toLowerCase()) && p.lat && p.lng);
      if (pMatch) coords = { lat: pMatch.lat, lng: pMatch.lng };
    }

    if (coords) {
      setMapCenter(coords);
      setMapZoom(13);
      const matchingProp = props.find(p => 
        p.loc && p.loc.toLowerCase().includes(loc.name.toLowerCase()) && p.lat && p.lng
      );
      if (matchingProp) {
        setActiveMarker(matchingProp.id);
      } else {
        setActiveMarker(null);
      }
    }
  };

  const handleImageError = (e, locName) => {
    e.currentTarget.onerror = null;
    const lower = (locName || '').toLowerCase();
    for (const [key, fallbackUrl] of Object.entries(DEFAULT_LOC_PHOTOS)) {
      if (lower.includes(key) || key.includes(lower)) {
        e.currentTarget.src = fallbackUrl;
        return;
      }
    }
    e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80';
  };

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.success && res.data.data) {
          const d = res.data.data;
          setCmsSettings(prev => ({
            ...prev,
            hero_headline: d.hero_headline || prev.hero_headline,
            hero_subheadline: d.hero_subheadline || prev.hero_subheadline,
            hero_announcement: d.hero_announcement !== undefined ? d.hero_announcement : prev.hero_announcement,
            popular_locations: Array.isArray(d.popular_locations) && d.popular_locations.length > 0 ? d.popular_locations : prev.popular_locations
          }));
        }
      })
      .catch(() => {});
  }, []);
  
  return (
    <>
      <Helmet>
        <title>KARMA Real Estate | Properties in Kerala & Kannur</title>
        <meta name="description" content="Find your dream property in Kerala. Buy, rent, or lease premium properties in Iritty, Kannur, Kochi, Kozhikode, Wayanad verified by KARMA Real Estate." />
      </Helmet>
      <section className="hero-split">
        <div className="hero-left">
          <div className="hero-left-content">
            {cmsSettings.hero_announcement && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 99,
                background: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                color: '#A8833E',
                fontSize: 12.5,
                fontWeight: 700,
                marginBottom: 16
              }}>
                <span>{cmsSettings.hero_announcement}</span>
              </div>
            )}
            <h1 className="hero-h1">{cmsSettings.hero_headline}</h1>
            <p className="hero-desc" style={{ marginBottom: '32px' }}>{cmsSettings.hero_subheadline}</p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap gap-3 md:gap-4 mb-10">
              <Link to="/results?purpose=Sale" className="bg-white px-4 md:px-5 py-2.5 rounded-full text-[13px] md:text-[14px] font-medium text-gray-800 no-underline shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all flex items-center gap-2" style={{ textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Buy
              </Link>
              <Link to="/results?purpose=Rent" className="bg-white px-4 md:px-5 py-2.5 rounded-full text-[13px] md:text-[14px] font-medium text-gray-800 no-underline shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all flex items-center gap-2" style={{ textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                Rent
              </Link>
              <Link to="/results?purpose=Lease" className="bg-white px-4 md:px-5 py-2.5 rounded-full text-[13px] md:text-[14px] font-medium text-gray-800 no-underline shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all flex items-center gap-2" style={{ textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                Lease
              </Link>
              <button onClick={() => window.dispatchEvent(new Event('open-sell-modal'))} className="bg-white px-4 md:px-5 py-2.5 rounded-full text-[13px] md:text-[14px] font-medium text-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                Sell
              </button>
            </div>

            <div className="hero-locs">
              <div className="hl-header">
                <div className="hl-title-group">
                  <h3 className="hl-title">Popular Locations</h3>
                  <span className="hl-badge">
                    {(cmsSettings.popular_locations || []).length} Places
                  </span>
                </div>
                <div className="hl-nav-group">
                  <button
                    type="button"
                    onClick={() => scrollLocations('left')}
                    disabled={!canScrollLeft}
                    className="hl-nav-btn"
                    aria-label="Previous locations"
                    title="Scroll left"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollLocations('right')}
                    disabled={!canScrollRight}
                    className="hl-nav-btn"
                    aria-label="Next locations"
                    title="Scroll right"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>

              {activeLoc && (
                <div className="hl-active-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="hl-pulse-dot"></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      Viewing <strong>{activeLoc}</strong> on map
                      {getMatchingCount(activeLoc) > 0 ? ` (${getMatchingCount(activeLoc)} properties)` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Link
                      to={`/results?loc=${encodeURIComponent(activeLoc)}`}
                      className="hl-active-explore"
                    >
                      <span>Explore</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLoc(null);
                        setMapCenter({ lat: 11.8745, lng: 75.3704 });
                        setMapZoom(9);
                        setActiveMarker(null);
                      }}
                      className="hl-active-reset"
                      title="Reset map view"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="hl-scroll-container">
                <div className="hl-scroll" ref={locScrollRef}>
                  {(cmsSettings.popular_locations || []).map((loc, idx) => {
                    const isActive = activeLoc === loc.name;
                    const count = getMatchingCount(loc.name);
                    return (
                      <div
                        key={idx}
                        className={`hl-card ${isActive ? 'active' : ''}`}
                        onClick={() => handleLocationClick(loc)}
                        role="button"
                        tabIndex={0}
                        title={`Click to view ${loc.name} on map`}
                      >
                        {isActive && (
                          <div className="hl-card-active-tag">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                            <span>Live</span>
                          </div>
                        )}
                        <Link
                          to={`/results?loc=${encodeURIComponent(loc.name)}`}
                          className="hl-card-explore-btn"
                          title={`Explore all properties in ${loc.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                        </Link>
                        <img
                          src={loc.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80'}
                          alt={loc.name}
                          loading="lazy"
                          onError={(e) => handleImageError(e, loc.name)}
                        />
                        <div className="hl-card-content">
                          <span className="hl-card-name">{loc.name}</span>
                          <span className="hl-card-sub">
                            {count > 0 ? `${count} listings` : 'Explore area'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="hero-cta">
              <Link to="/results" className="hero-cta-btn" style={{ background: 'var(--blue)', color: '#fff', boxShadow: '0 8px 20px rgba(255, 56, 92, 0.25)' }}>
                Explore Properties
              </Link>
              <a href="https://wa.me/919995797450" target="_blank" rel="noreferrer" className="hero-cta-btn" style={{ background: '#25D366', color: '#fff', boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.01a10 10 0 0 0-8.52 15.27L2 22l4.87-1.46a10 10 0 1 0 5.14-18.53zm0 18A8 8 0 0 1 7.2 18.9l-.35-.2-3.6 1.08 1.1-3.5-.2-.36A8 8 0 1 1 12.01 20zm4.27-5.83c-.23-.12-1.38-.68-1.59-.76-.22-.08-.38-.12-.54.12s-.6 .76-.74.92c-.14.16-.27.18-.5.06a6.56 6.56 0 0 1-1.92-1.18 7.2 7.2 0 0 1-1.33-1.66c-.14-.24-.01-.37.1-.49.1-.11.23-.27.35-.4a1.6 1.6 0 0 0 .15-.25c.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.47-.4-.4-.54-.41-.14 0-.3-.01-.46-.01a.89.89 0 0 0-.64.3c-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.7 2.6 4.12 3.64 1.48.64 2.15.7 2.94.59.56-.08 1.38-.56 1.57-1.1.2-.54.2-.1.14-.11z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hr-map">
            {/* View Mode Toggle Controls */}
            <div className="hr-controls">
              <button
                onClick={() => setViewMode('map')}
                className={`hr-btn ${viewMode === 'map' ? 'active' : ''}`}
                aria-label="Map View"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`hr-btn ${viewMode === 'list' ? 'active' : ''}`}
                aria-label="List View"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                List View
              </button>
            </div>

            {/* Render Map View vs List View */}
            {viewMode === 'map' ? (
              <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                <Map
                  defaultZoom={9}
                  minZoom={7}
                  maxZoom={18}
                  defaultCenter={{ lat: 11.4500, lng: 75.7000 }}
                  restriction={{
                    latLngBounds: {
                      north: 13.10,
                      south: 8.10,
                      west: 74.30,
                      east: 77.80
                    },
                    strictBounds: true
                  }}
                  mapId="DEMO_MAP_ID"
                  disableDefaultUI={true}
                  gestureHandling={'greedy'}
                  style={{ width: '100%', height: '100%' }}
                >
                  <MapCenterController center={mapCenter} zoom={mapZoom} />
                  {props.filter(p => p.lat && p.lng).map(p => (
                    <AdvancedMarker 
                      key={p.id} 
                      position={{ lat: p.lat, lng: p.lng }}
                      onMouseEnter={() => setActiveMarker(p.id)}
                      onMouseLeave={() => setActiveMarker(null)}
                      onClick={() => setActiveMarker(p.id === activeMarker ? null : p.id)}
                    >
                      <div className={`nq-marker ${activeMarker === p.id ? 'active' : ''}`} style={{ position: 'relative', transform: 'translate(0, -10px)' }}>
                        {p.priceFormatted || formatIndianPrice(p.price, p.purpose)}
                        <div className="nq-marker-caret"></div>
                        
                        {activeMarker === p.id && (
                          <div className="nq-map-popup">
                            <img src={p.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={p.title} />
                            <div className="nq-mp-info">
                              <b>{p.title}</b>
                              <div className="nq-mp-meta">
                                <span>⭐ 4.8</span>
                                <strong>{p.priceFormatted || formatIndianPrice(p.price, p.purpose)}</strong>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </AdvancedMarker>
                  ))}
                </Map>
              </APIProvider>
            ) : (
              <div className="hr-list-wrap">
                <div className="hr-list-header">
                  <span className="hr-list-title">Verified Listings</span>
                  <span className="hr-list-count">{props.length} Properties</span>
                </div>
                {props.map((p) => (
                  <Link
                    key={p.id}
                    to={`/kannur/${p.type?.toLowerCase() || 'property'}/${p.slug || p.id}`}
                    className="hr-list-card"
                  >
                    <img
                      src={p.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'}
                      alt={p.title}
                      className="hr-list-img"
                      loading="lazy"
                    />
                    <div className="hr-list-info">
                      <div>
                        <div className="hr-list-name">{p.title || `${p.type} in ${p.loc}`}</div>
                        <div className="hr-list-sub">📍 {p.loc} &middot; {p.type}</div>
                      </div>
                      <div className="hr-list-price">
                        {p.priceFormatted || formatIndianPrice(p.price, p.purpose)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section" id="featured">
        <div className="sec-head" style={{ justifyContent: 'flex-start', gap: '12px' }}>
          <h2>Featured Prime Properties in Kannur</h2>
          <Link to="/results" className="sec-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></Link>
        </div>
        <CardCarousel>
          {(props.some(p => p.featured) ? props.filter(p => p.featured) : props).slice(0, 10).map((p, i) => (
            <PropertyCard key={p.id} p={p} idx={i} />
          ))}
        </CardCarousel>
      </section>

      <section className="section" id="recent" style={{ paddingBottom: '24px' }}>
        <div className="sec-head" style={{ justifyContent: 'flex-start', gap: '12px' }}>
          <h2>Recently Added Verified Listings</h2>
          <Link to="/results" className="sec-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></Link>
        </div>
        <CardCarousel>
          {props.slice(0, 10).map((p, i) => (
            <PropertyCard key={p.id} p={p} idx={i} />
          ))}
        </CardCarousel>
      </section>

      <ClientsSectionDemo />
    </>
  )
}
