import React, { useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppDataContext } from '../../context/AppDataContext';

function PropertyCard({ p, idx = 0 }) {
  const rating = (4.5 + Math.random() * 0.5).toFixed(2);
  return (
    <Link to={`/kannur/${p.type.toLowerCase()}/${p.id}`} className="pcard">
      <div className="pc-media">
        <span className="pc-tag">Guest favourite</span>
        <button className="pc-heart" onClick={(e) => {e.preventDefault();}} aria-label="Add to wishlist">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false"><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94c-2.8 0-5.46 1.4-6.98 3.73C14.54 5.4 11.88 4 9.08 4 5.2 4 2 7.15 2 11.08c0 7 7 12.27 14 17z"></path></svg>
        </button>
        <div className="pc-track">
          <img src={p.imgs?.[idx % (p.imgs?.length || 1)] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={p.title} />
        </div>
      </div>
      <div className="pc-body">
        <div className="pc-title">{p.type} in {p.loc}</div>
        <div className="pc-meta" style={{ color: '#717171' }}>
          <span style={{ color: '#222' }}>₹{p.price} L {p.status === 'rent' ? '/ month' : ''}</span> &middot; ★ {rating}
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

export default function PropertiesPage() {
  const { props } = useContext(AppDataContext);

  useEffect(() => {
    document.title = 'KARMA Real Estate | Properties';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="props-page pb-30" style={{ paddingTop: '100px' }}>
      
      {/* Categories Subnav */}
      <div className="props-subnav-wrap">
        <div className="props-subnav">
          <button className="ps-item active">
            <span className="ps-icon">🌍</span>
            <span>All</span>
          </button>
          <button className="ps-item">
            <span className="ps-icon">🏡</span>
            <span>Homes</span>
          </button>
          <button className="ps-item">
            <span className="ps-icon">🎈</span>
            <span>Experiences</span>
          </button>
          <button className="ps-item">
            <span className="ps-icon">🛎️</span>
            <span>Services</span>
          </button>
        </div>
      </div>

      {/* Continue Searching Banner */}
      <div className="section" style={{ paddingTop: '24px' }}>
        <div className="continue-search">
          <div className="cs-img">
            <img src={props[0]?.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt="recent" />
          </div>
          <div className="cs-info">
            <strong>Continue searching for homes in Kannur</strong>
            <span>16-17 Sept &middot; 5 guests</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </div>

      <section className="section" id="featured">
        <div className="sec-head" style={{ justifyContent: 'flex-start', gap: '12px' }}>
          <h2>Based on your Kannur search</h2>
          <Link to="/results" className="sec-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></Link>
        </div>
        <CardCarousel>
          {[...props.filter(p => p.featured), ...props.filter(p => p.featured), ...props].slice(0, 14).map((p, i) => (
            <PropertyCard key={`${p.id}-${i}`} p={p} idx={i} />
          ))}
        </CardCarousel>
      </section>

      <section className="section" id="payyambalam">
        <div className="sec-head" style={{ justifyContent: 'flex-start', gap: '12px' }}>
          <h2>Stay near Payyambalam Beach</h2>
          <Link to="/results" className="sec-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></Link>
        </div>
        <CardCarousel>
          {[...props].reverse().slice(0, 14).map((p, i) => (
            <PropertyCard key={`${p.id}-${i}`} p={p} idx={i} />
          ))}
        </CardCarousel>
      </section>

      <section className="section" id="cancellation" style={{ paddingBottom: '24px' }}>
        <div className="sec-head" style={{ justifyContent: 'flex-start', gap: '12px' }}>
          <h2>Kannur homes with free cancellation</h2>
          <Link to="/results" className="sec-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></Link>
        </div>
        <CardCarousel>
          {[...props, ...props, ...props].slice(0, 14).map((p, i) => (
            <PropertyCard key={`${p.id}-${i}`} p={p} idx={i} />
          ))}
        </CardCarousel>
      </section>
    </div>
  );
}
