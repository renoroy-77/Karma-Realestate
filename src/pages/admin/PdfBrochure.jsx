import { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDataContext, formatIndianPrice } from '../../context/AppDataContext';
import { Helmet } from 'react-helmet-async';

export default function PdfBrochure() {
  const { id } = useParams();
  const { props } = useContext(AppDataContext);
  const navigate = useNavigate();
  
  const pId = parseInt(id);
  const p = props.find(x => x.id === pId);

  useEffect(() => {
    if (p) {
      // Small delay to ensure images load before print dialog
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [p]);

  // If user cancels print, give them a way back
  const goBack = () => navigate(-1);

  if (!p) return <div>Property not found</div>;

  return (
    <>
      <Helmet>
        <title>{p.title} - KARMA Brochure</title>
        <style>{`
          body { background: #fff; color: #1c1c1c; font-family: 'Inter', sans-serif; }
          .no-print { display: none; }
          @media print {
            .no-print { display: none !important; }
            @page { margin: 0; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
            .page-break { page-break-before: always; }
          }
          .pdf-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: #fff;
            position: relative;
            box-sizing: border-box;
            padding: 40px;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            font-weight: 800;
            color: rgba(26, 77, 143, 0.05);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
          }
          .pdf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1a4d8f;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .pdf-logo { font-size: 24px; font-weight: 800; color: #1a4d8f; letter-spacing: -0.5px; }
          .pdf-logo span { color: #8fa3c2; font-weight: 600; font-size: 14px; display: block; letter-spacing: 1px; }
          .pdf-contact { text-align: right; font-size: 12px; color: #6b7280; }
          
          .pdf-hero { width: 100%; height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; }
          
          .pdf-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
          .pdf-title { font-size: 28px; font-weight: 700; margin: 0 0 8px 0; color: #1c1c1c; }
          .pdf-subtitle { font-size: 16px; color: #6b7280; margin: 0; }
          .pdf-price { font-size: 24px; font-weight: 800; color: #1a4d8f; text-align: right; }
          
          .pdf-specs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; background: #f7f9fc; padding: 20px; border-radius: 12px; }
          .spec-item { display: flex; flex-direction: column; gap: 4px; }
          .spec-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; }
          .spec-value { font-size: 16px; font-weight: 700; color: #1c1c1c; }
          
          .pdf-section { margin-bottom: 30px; z-index: 1; position: relative; }
          .pdf-section h3 { font-size: 18px; font-weight: 700; border-bottom: 1px solid #e5e8ec; padding-bottom: 8px; margin-bottom: 16px; color: #1c1c1c; }
          .pdf-section p { font-size: 14px; line-height: 1.6; color: #4a4a4a; }
          
          .pdf-list { font-size: 14px; line-height: 1.6; color: #4a4a4a; padding-left: 20px; }
          .pdf-list li { margin-bottom: 8px; }
          
          .pdf-footer { position: absolute; bottom: 40px; left: 40px; right: 40px; border-top: 1px solid #e5e8ec; padding-top: 20px; text-align: center; font-size: 11px; color: #6b7280; }
        `}</style>
      </Helmet>

      {/* Screen-only back button */}
      <div className="no-print" style={{ padding: '20px', textAlign: 'center', background: '#f7f9fc', borderBottom: '1px solid #e5e8ec' }}>
        <p style={{marginBottom: 12}}>Generating PDF brochure... If the print dialog didn't open, press Ctrl+P (or Cmd+P).</p>
        <button onClick={goBack} style={{ padding: '8px 16px', background: '#1a4d8f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          ← Back to Admin
        </button>
      </div>

      <div className="pdf-container">
        <div className="watermark">KARMA REAL ESTATE</div>
        
        <div className="pdf-header">
          <div className="pdf-logo">
            KARMA
            <span>REAL ESTATE</span>
          </div>
          <div className="pdf-contact">
            Fort Road, Kannur City<br/>
            Kerala 670001<br/>
            +91 99957 97450 • karmarealestate.in
          </div>
        </div>

        {p.imgs && p.imgs[0] && (
          <img src={p.imgs[0]} alt="Property Hero" className="pdf-hero" crossOrigin="anonymous" />
        )}

        <div className="pdf-title-row">
          <div>
            <h1 className="pdf-title">{p.title}</h1>
            <p className="pdf-subtitle">{p.loc} • {p.type} for {p.purpose}</p>
          </div>
          <div className="pdf-price">
            {p.priceFormatted || formatIndianPrice(p.price, p.purpose)}<br/>
            {p.nego && <span style={{fontSize: 12, fontWeight: 500, color: '#6b7280'}}>Negotiable</span>}
          </div>
        </div>

        <div className="pdf-specs">
          <div className="spec-item">
            <span className="spec-label">Property Type</span>
            <span className="spec-value">{p.type}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Area</span>
            <span className="spec-value">{p.area || p.land || 'N/A'}</span>
          </div>
          {p.beds ? (
            <div className="spec-item">
              <span className="spec-label">Bedrooms</span>
              <span className="spec-value">{p.beds} BHK</span>
            </div>
          ) : p.baths ? (
            <div className="spec-item">
              <span className="spec-label">Bathrooms</span>
              <span className="spec-value">{p.baths} Bath</span>
            </div>
          ) : (
            <div className="spec-item">
              <span className="spec-label">Status</span>
              <span className="spec-value">{p.status}</span>
            </div>
          )}
          <div className="spec-item">
            <span className="spec-label">Listed Date</span>
            <span className="spec-value">{p.listed || '2026-09-20'}</span>
          </div>
        </div>

        <div className="pdf-section">
          <h3>Overview</h3>
          <p>{p.desc}</p>
        </div>

        {p.amenities && p.amenities.length > 0 && (
          <div className="pdf-section">
            <h3>Amenities & Facilities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {p.amenities.map((a, i) => (
                <span key={i} style={{ padding: '4px 10px', background: '#f0fdf4', color: '#166534', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                  ✓ {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {(p.pros || p.cons) && (
          <div className="pdf-section">
            <h3>Highlights & Notes</h3>
            <div style={{ display: 'flex', gap: '40px' }}>
              {p.pros && (
                <div style={{ flex: 1 }}>
                  <b style={{color: '#2E9E5B'}}>What we love</b>
                  <ul className="pdf-list">
                    {p.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                  </ul>
                </div>
              )}
              {p.cons && (
                <div style={{ flex: 1 }}>
                  <b style={{color: '#D64545'}}>Keep in mind</b>
                  <ul className="pdf-list">
                    {p.cons.map((con, i) => <li key={i}>{con}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pdf-footer">
          This brochure was generated on {new Date().toLocaleDateString('en-GB')}. Prices and availability are subject to change. <br/>
          {p.rera ? `K-RERA Registration: ${p.rera}` : 'Contact KARMA Real Estate for official details and site visits.'}
        </div>
      </div>
    </>
  );
}
