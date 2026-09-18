import { useContext } from 'react';
import { AppDataContext } from '../../context/AppDataContext';
import { Link } from 'react-router-dom';
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

export default function Wishlist() {
  const { props, wishlist } = useContext(AppDataContext);
  
  const savedProps = props.filter(p => wishlist.includes(p.id));

  return (
    <>
      <Helmet>
        <title>Your Wishlist | KARMA Real Estate Kannur</title>
        <meta name="description" content="View your saved properties in Kannur." />
      </Helmet>
      <section className="detail" style={{ minHeight: '80vh' }}>
      <div className="d-head">
        <h1>Your Wishlist</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>{savedProps.length} saved properties</p>
      </div>

      {savedProps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-[32px] mt-10 border border-gray-100 bg-gradient-to-b from-gray-50 to-white shadow-sm">
          <div className="w-24 h-24 rounded-full bg-[#f3f4f6] text-[#111] flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Your wishlist is empty</h2>
          <p className="text-gray-500 text-base max-w-md mb-8 leading-relaxed">
            As you browse properties, tap the heart icon to save your favorites. They'll be waiting for you here.
          </p>
          <Link to="/results" className="bg-[#111] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-black hover:-translate-y-0.5 transition-all shadow-md">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="similar-grid" style={{ marginTop: 40 }}>
          {savedProps.map(p => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
    </>
  );
}
