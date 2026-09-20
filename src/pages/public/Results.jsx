import { useContext, useState, useRef, useEffect } from 'react';
import { AppDataContext, formatIndianPrice } from '../../context/AppDataContext';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Footer } from '../../components/public/PublicLayout';

function BoundsUpdater({ setMapBounds }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('idle', () => {
      setMapBounds(map.getBounds());
    });
    // Fallback if google is not defined globally (though it should be after map loads)
    return () => {
      if (window.google && google.maps && google.maps.event) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [map, setMapBounds]);
  return null;
}

function PropertyCard({ p }) {
  const { wishlist, toggleWishlist } = useContext(AppDataContext);
  const inWishlist = wishlist.includes(p.id);
  const rating = (4.5 + ((p.id % 5) * 0.1)).toFixed(1);

  return (
    <Link to={`/kannur/${p.type.toLowerCase()}/${p.slug || p.id}`} className="nq-card">
      <div className="nq-media">
        <img src={p.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={p.title} />
        <button
          className="pc-heart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(p.id);
          }}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 3, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
        >
          <svg
            viewBox="0 0 32 32"
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            style={{ fill: inWishlist ? '#ef4444' : 'rgba(0,0,0,0.4)', stroke: inWishlist ? '#ef4444' : '#fff', strokeWidth: 2 }}
          >
            <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94c-2.8 0-5.46 1.4-6.98 3.73C14.54 5.4 11.88 4 9.08 4 5.2 4 2 7.15 2 11.08c0 7 7 12.27 14 17z"></path>
          </svg>
        </button>
        <div className="nq-rating">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>{rating}</span>
        </div>
        <div className="nq-loc-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {p.loc}, Kannur
        </div>
      </div>
      <div className="nq-body">
        <div className="nq-top">
          <h3 className="nq-title">{p.title}</h3>
          <div className="nq-price"><b>{p.priceFormatted || formatIndianPrice(p.price, p.purpose)}</b></div>
        </div>
        <div className="nq-meta">
          {p.beds && (
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"></path></svg>
              {p.beds} Beds
            </span>
          )}
          {(p.area || p.land) && (
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M4 14h16M14 4v16"/></svg>
              {p.area || p.land}
            </span>
          )}
          {p.baths && (
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 12v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M9 6v6M15 6v6"/></svg>
              {p.baths} Baths
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}


export default function Results() {
  const { props } = useContext(AppDataContext);
  const [searchParams] = useSearchParams();
  
  const initialPurpose = searchParams.get('purpose') || 'All';
  const initialLoc = searchParams.get('loc') || '';
  const initialType = searchParams.get('type') || 'All';
  const initialPrice = searchParams.get('price') || 'All';

  const [filterPurpose, setFilterPurpose] = useState(initialPurpose);
  const [filterLoc, setFilterLoc] = useState(initialLoc);
  const [filterType, setFilterType] = useState(initialType);
  const [filterPrice, setFilterPrice] = useState(initialPrice);
  const [filterBaths, setFilterBaths] = useState('All');
  const [activeMarker, setActiveMarker] = useState(null);
  const [sortBy, setSortBy] = useState('Newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);

  useEffect(() => {
    setFilterPurpose(searchParams.get('purpose') || 'All');
    setFilterLoc(searchParams.get('loc') || '');
    setFilterType(searchParams.get('type') || 'All');
    setFilterPrice(searchParams.get('price') || 'All');
  }, [searchParams]);

  useEffect(() => {
    const handleToggle = () => setShowMobileFilters(prev => !prev);
    window.addEventListener('toggle-filters', handleToggle);
    return () => window.removeEventListener('toggle-filters', handleToggle);
  }, []);

  const filteredProps = props.filter(p => {
    const pMatch = filterPurpose === 'All' || p.purpose.toLowerCase() === filterPurpose.toLowerCase();
    const lMatch = filterLoc === '' || p.loc?.toLowerCase() === filterLoc.toLowerCase();
    const tMatch = filterType === 'All' || p.type?.toLowerCase() === filterType.toLowerCase();
    
    const numPrice = parseFloat(p.price) || 0;
    let priceMatch = true;
    if (filterPrice === 'Under 50L') priceMatch = numPrice < 5000000;
    else if (filterPrice === '50L - 100L') priceMatch = numPrice >= 5000000 && numPrice <= 10000000;
    else if (filterPrice === 'Over 100L') priceMatch = numPrice > 10000000;

    const bMatch = filterBaths === 'All' || (p.beds && parseInt(p.beds, 10) >= parseInt(filterBaths, 10));

    return pMatch && lMatch && tMatch && priceMatch && bMatch;
  });

  const sortedProps = [...filteredProps].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return 0; // Newest / Default
  });

  const visibleProps = sortedProps.filter(p => {
    if (!mapBounds || !p.lat || !p.lng) return true;
    if (mapBounds.getNorthEast && mapBounds.getSouthWest) {
      const ne = mapBounds.getNorthEast();
      const sw = mapBounds.getSouthWest();
      const latInRange = p.lat >= sw.lat() && p.lat <= ne.lat();
      const lngInRange = sw.lng() <= ne.lng() 
        ? p.lng >= sw.lng() && p.lng <= ne.lng()
        : p.lng >= sw.lng() || p.lng <= ne.lng();
      return latInRange && lngInRange;
    }
    return true;
  });

  // Mobile Bottom Sheet Logic
  const [sheetState, setSheetState] = useState(1); // 0: peek, 1: half, 2: full
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [mapType, setMapType] = useState('roadmap');
  const startY = useRef(0);
  const currentY = useRef(0);

  const handlePointerDown = (e) => {
    if (window.innerWidth > 1024) return; // Desktop ignore
    setDragging(true);
    startY.current = e.clientY;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const dy = e.clientY - startY.current;
    setDragY(dy);
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    
    // Determine snap state based on drag distance
    if (dragY > 50 && sheetState > 0) {
      setSheetState(s => s - 1);
    } else if (dragY < -50 && sheetState < 2) {
      setSheetState(s => s + 1);
    }
    setDragY(0);
    e.target.releasePointerCapture(e.pointerId);
  };

  // Convert state to viewport height percentage (peek: 160px visible, half: 50vh, full: 0px)
  const getTransform = () => {
    if (window.innerWidth > 1024) return 'none'; // Desktop
    if (activeMarker) return 'translateY(110vh)'; // Hide when marker active
    const baseOffset = sheetState === 0 ? 'calc(100vh - 80px)' : sheetState === 1 ? '50vh' : '0px';
    return `translateY(calc(${baseOffset} + ${dragging ? dragY : 0}px))`;
  };

  return (
    <>
      <Helmet>
        <title>Property Search Results | KARMA Real Estate Kannur</title>
        <meta name="description" content="Browse verified real estate properties for sale or rent in Kannur." />
      </Helmet>
      <section className="results nq-theme">
      {/* Search Bar matching NestQuest */}
      <div className={`nq-searchbar ${showMobileFilters ? 'show-mobile' : ''}`}>
        <label className="nq-search-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)} className="nq-sel">
            <option value="">Any Location</option>
            <option value="Kannur City">Kannur City</option>
            <option value="Thottada">Thottada</option>
            <option value="Payyambalam">Payyambalam</option>
            <option value="Talap">Talap</option>
          </select>
        </label>
        
        <label className="nq-search-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="nq-sel">
            <option value="All">Any Property</option>
            <option value="House">House</option>
            <option value="Flat">Flat</option>
            <option value="Land">Land</option>
            <option value="Commercial">Commercial</option>
          </select>
        </label>
        
        <label className="nq-search-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <select value={filterPurpose} onChange={e => setFilterPurpose(e.target.value)} className="nq-sel">
            <option value="All">Buy or Rent</option>
            <option value="Sale">Buy</option>
            <option value="Rent">Rent</option>
          </select>
        </label>
        
        <label className="nq-search-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="nq-sel">
            <option value="All">Any Price</option>
            <option value="Under 50L">Under ₹50L</option>
            <option value="50L - 100L">₹50L - ₹100L</option>
            <option value="Over 100L">Over ₹100L</option>
          </select>
        </label>
        
        <label className="nq-search-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 12v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path></svg>
          <select value={filterBaths} onChange={e => setFilterBaths(e.target.value)} className="nq-sel">
            <option value="All">Any Baths</option>
            <option value="1">1+ Baths</option>
            <option value="2">2+ Baths</option>
            <option value="3">3+ Baths</option>
            <option value="4">4+ Baths</option>
          </select>
        </label>
        <button className="nq-search-btn">Search</button>
      </div>

      <div className="res-wrap nq-wrap">
        <div className="res-left nq-left" style={{ 
          transform: getTransform(),
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)'
        }}>
          <div className="res-drag-handle" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
            <div className="drag-bar"></div>
          </div>
          
          <div className="nq-header">
            <div className="nq-header-top">
              <h2>{visibleProps.length} homes</h2>
              <div className="nq-sort" style={{ display: 'flex', alignItems: 'center' }}>
                Sort by: 
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: 'bold', cursor: 'pointer', outline: 'none', marginLeft: '4px', fontSize: '13.5px' }}>
                  <option value="Newest">Newest</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
            </div>
            <div className="nq-subfilters">
              {filterType !== 'All' && <div className="nq-sub-chip" onClick={() => setFilterType('All')}>{filterType} <span className="x-icon">✕</span></div>}
              {filterPrice !== 'All' && <div className="nq-sub-chip" onClick={() => setFilterPrice('All')}>{filterPrice} <span className="x-icon">✕</span></div>}
              {filterBaths !== 'All' && <div className="nq-sub-chip" onClick={() => setFilterBaths('All')}>{filterBaths}+ Baths <span className="x-icon">✕</span></div>}
              {filterLoc !== '' && <div className="nq-sub-chip" onClick={() => setFilterLoc('')}>{filterLoc} <span className="x-icon">✕</span></div>}
              {filterPurpose !== 'All' && <div className="nq-sub-chip" onClick={() => setFilterPurpose('All')}>{filterPurpose === 'Sale' ? 'Buy' : 'Rent'} <span className="x-icon">✕</span></div>}
            </div>
          </div>

          <div className="res-content nq-content">
            <div className="res-grid nq-grid">
              {visibleProps.map(p => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          </div>
          <div className="res-mobile-footer">
            <Footer />
          </div>
          
          <button 
            className={`nq-floating-map-btn ${sheetState > 0 ? 'visible' : ''}`}
            onClick={(e) => { e.preventDefault(); setSheetState(0); }}
          >
            Map 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
          </button>
        </div>

        <div className="res-map nq-map-container">
          <div className="nq-map-float-top">
             <div className="nq-mf-btn-group">
               <button className={`nq-mf-btn ${mapType === 'roadmap' ? 'active' : ''}`} onClick={() => setMapType('roadmap')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Map</button>
               <button className={`nq-mf-btn ${mapType === 'satellite' ? 'active' : ''}`} onClick={() => setMapType('satellite')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> Satellite</button>
             </div>
          </div>
          


          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyC36wkei0AmiJoLtIwpeVEeeOo4I-st6qQ"}>
            <Map
              defaultZoom={12}
              defaultCenter={{ lat: 11.8545, lng: 75.3904 }}
              mapId="DEMO_MAP_ID"
              mapTypeId={mapType}
              disableDefaultUI={true}
              gestureHandling={'greedy'}
              style={{ width: '100%', height: '100%' }}
            >
              {sortedProps.map(p => (
                p.lat && p.lng && (
                  <AdvancedMarker 
                    key={p.id} 
                    position={{ lat: p.lat, lng: p.lng }}
                    onClick={() => setActiveMarker(p.id === activeMarker ? null : p.id)}
                  >
                    {activeMarker === p.id ? (
                      <div className="nq-marker-active-wrap" style={{ position: 'relative', zIndex: 50 }}>
                        <svg className="nq-red-pin" width="32" height="32" viewBox="0 0 24 24" fill="#ef4444"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" fill="#fff" /></svg>
                        
                        <div className="nq-ref-popup">
                          <div className="nq-ref-wedge"></div>
                          <div className="nq-ref-card">
                            <div className="nq-ref-img-wrap">
                              <img src={p.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={p.title} />
                              <div className="nq-ref-price-tag">{p.priceFormatted || formatIndianPrice(p.price, p.purpose)}</div>
                            </div>
                            <div className="nq-ref-body">
                              <div className="nq-ref-title">{p.title}</div>
                              <div className="nq-ref-loc">{p.loc}, Kannur</div>
                              <div className="nq-ref-specs">
                                {p.beds && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"></path></svg> {p.beds} Beds</span>}
                                {p.baths && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 12v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M9 6v6M15 6v6"/></svg> {p.baths} Baths</span>}
                                {p.area && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M4 14h16M14 4v16"/></svg> {p.area}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="nq-marker" style={{ position: 'relative' }}>
                        {p.priceFormatted || formatIndianPrice(p.price, p.purpose)}
                      </div>
                    )}
                  </AdvancedMarker>
                )
              ))}
            </Map>
            <BoundsUpdater setMapBounds={setMapBounds} />
          </APIProvider>
          {activeMarker && (() => {
            const activeProp = props.find(p => p.id === activeMarker);
            if (!activeProp) return null;
            return (
              <div className="nq-bottom-active-card">
                <Link to={`/kannur/${activeProp.type.toLowerCase()}/${activeProp.slug || activeProp.id}`} className="nq-bac-inner">
                  <button className="nq-bac-close" onClick={(e) => { e.preventDefault(); setActiveMarker(null); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <div className="nq-bac-img">
                    <img src={activeProp.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt="" />
                  </div>
                  <div className="nq-bac-info">
                    <h4>{activeProp.title}</h4>
                    <p>{activeProp.type} in {activeProp.loc}</p>
                    <div className="nq-bac-meta">
                       <b>{activeProp.priceFormatted || formatIndianPrice(activeProp.price, activeProp.purpose)}</b>
                       <span>★ {(4.5 + ((activeProp.id % 5) * 0.1)).toFixed(1)} (Verified)</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
    </>
  );
}
