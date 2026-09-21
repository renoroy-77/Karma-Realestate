import { useRef, useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppDataContext, formatIndianPrice } from '../../context/AppDataContext';
import { Helmet } from 'react-helmet-async';

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

export default function PropertiesPage() {
  const { props } = useContext(AppDataContext);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { label: 'All', icon: '🌍' },
    { label: 'House', icon: '🏡' },
    { label: 'Apartment', icon: '🏢' },
    { label: 'Plot', icon: '🌾' },
    { label: 'Commercial', icon: '🏪' }
  ];

  const filteredByCategory = activeCategory === 'All'
    ? props
    : props.filter(p => p.type === activeCategory || (activeCategory === 'House' && p.type === 'Villa'));

  const villas = props.filter(p => p.type === 'House' || p.type === 'Villa');
  const plots = props.filter(p => p.type === 'Plot' || p.type === 'Land');

  return (
    <>
      <Helmet>
        <title>Explore Properties in Kannur | KARMA Real Estate</title>
        <meta name="description" content="Browse verified houses, luxury villas, plots, and commercial properties across Kannur with KARMA Real Estate." />
      </Helmet>
      
      <div className="props-page pb-30" style={{ paddingTop: '100px' }}>
        
        {/* Categories Subnav */}
        <div className="props-subnav-wrap">
          <div className="props-subnav">
            {categories.map(cat => (
              <button
                key={cat.label}
                className={`ps-item ${activeCategory === cat.label ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.label)}
              >
                <span className="ps-icon">{cat.icon}</span>
                <span>{cat.label === 'House' ? 'Villas & Houses' : cat.label === 'Plot' ? 'Plots & Land' : cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Searching Banner */}
        <div className="section" style={{ paddingTop: '24px' }}>
          <Link to="/results" style={{ textDecoration: 'none' }}>
            <div className="continue-search" style={{ cursor: 'pointer' }}>
              <div className="cs-img">
                <img src={props[0]?.imgs?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt="recent" />
              </div>
              <div className="cs-info">
                <strong>Explore verified properties across Kannur</strong>
                <span>Filter by price, bedrooms, locality & verified title deeds</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Selected Category Carousel */}
        <section className="section" id="featured">
          <div className="sec-head" style={{ justifyContent: 'flex-start', gap: '12px' }}>
            <h2>{activeCategory === 'All' ? 'All Verified Properties' : `${activeCategory} Listings in Kannur`} · {filteredByCategory.length}</h2>
            <Link to={activeCategory === 'All' ? '/results' : `/results?type=${activeCategory}`} className="sec-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
          {filteredByCategory.length > 0 ? (
            <CardCarousel>
              {filteredByCategory.map((p, i) => (
                <PropertyCard key={`${p.id}-${i}`} p={p} idx={i} />
              ))}
            </CardCarousel>
          ) : (
            <div style={{ padding: '32px 0', color: 'var(--ink-2)' }}>No properties in this category yet.</div>
          )}
        </section>

        {/* Villas Section */}
        {villas.length > 0 && (
          <section className="section" id="villas">
            <div className="sec-head" style={{ justifyContent: 'flex-start', gap: '12px' }}>
              <h2>Luxury Villas & Independent Houses</h2>
              <Link to="/results?type=House" className="sec-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></Link>
            </div>
            <CardCarousel>
              {villas.map((p, i) => (
                <PropertyCard key={`villa-${p.id}-${i}`} p={p} idx={i} />
              ))}
            </CardCarousel>
          </section>
        )}

        {/* Plots Section */}
        {plots.length > 0 && (
          <section className="section" id="plots" style={{ paddingBottom: '24px' }}>
            <div className="sec-head" style={{ justifyContent: 'flex-start', gap: '12px' }}>
              <h2>Residential & Commercial Land</h2>
              <Link to="/results?type=Plot" className="sec-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></Link>
            </div>
            <CardCarousel>
              {plots.map((p, i) => (
                <PropertyCard key={`plot-${p.id}-${i}`} p={p} idx={i} />
              ))}
            </CardCarousel>
          </section>
        )}
      </div>
    </>
  );
}
