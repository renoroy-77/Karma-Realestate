import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function CMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [cmsData, setCmsData] = useState({
    hero_headline: 'Find Your Perfect Property in Kerala',
    hero_subheadline: 'Discover 1000+ verified properties across Kerala. Search by location, budget & lifestyle.',
    hero_announcement: '🔥 Kannur Airport Corridor Commercial Lands Available',
    agency_name: 'KARMA Real Estate',
    agency_phone: '+91 98765 43210',
    agency_whatsapp: '+919876543210',
    agency_email: 'info@karmarealestate.in',
    agency_address: 'KARMA Tower, 2nd Floor, South Bazar, Talap Road, Kannur, Kerala 670002',
    stats_properties: '1,000+',
    stats_clients: '850+',
    stats_volume: '₹250+ Cr'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data.success && res.data.data) {
        setCmsData(prev => ({
          ...prev,
          ...res.data.data
        }));
      }
    } catch (err) {
      console.warn('Could not load admin settings, falling back to defaults', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await api.post('/admin/settings', { settings: cmsData });
      if (res.data.success) {
        setSuccessMsg('All homepage and CMS settings have been saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error saving settings', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Hero & Content Management (CMS)
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Customize homepage hero text, announcement badges, agency contact details, and public metrics in real-time.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            background: saving ? '#94a3b8' : '#065f46',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(6, 95, 70, 0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          {saving ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 18px', borderRadius: 12, marginBottom: 24, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 18px', borderRadius: 12, marginBottom: 24, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>{errorMsg}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 28, alignItems: 'start' }}>
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Hero Section Box */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Homepage Hero Section</h2>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Primary headline and value proposition displayed on the website.</span>
              </div>
            </div>

            <div className="fld" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Hero Main Headline *
              </label>
              <input
                type="text"
                required
                value={cmsData.hero_headline}
                onChange={e => setCmsData({ ...cmsData, hero_headline: e.target.value })}
                placeholder="e.g. Find Your Perfect Property in Kerala"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div className="fld" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Hero Subheadline / Description *
              </label>
              <textarea
                rows="3"
                required
                value={cmsData.hero_subheadline}
                onChange={e => setCmsData({ ...cmsData, hero_subheadline: e.target.value })}
                placeholder="e.g. Discover 1000+ verified properties across Kerala. Search by location, budget & lifestyle."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, resize: 'vertical' }}
              />
            </div>

            <div className="fld">
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Announcement Badge Text (Top of Hero)
              </label>
              <input
                type="text"
                value={cmsData.hero_announcement}
                onChange={e => setCmsData({ ...cmsData, hero_announcement: e.target.value })}
                placeholder="e.g. 🔥 Kannur Airport Corridor Commercial Lands Available"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>

          {/* Social Proof & Metrics */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><circle cx="12" cy="12" r="4"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Social Proof & Key Statistics</h2>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Numbers displayed on trust badges and marketing banners.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Verified Properties
                </label>
                <input
                  type="text"
                  value={cmsData.stats_properties}
                  onChange={e => setCmsData({ ...cmsData, stats_properties: e.target.value })}
                  placeholder="1,000+"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Happy NRI Clients
                </label>
                <input
                  type="text"
                  value={cmsData.stats_clients}
                  onChange={e => setCmsData({ ...cmsData, stats_clients: e.target.value })}
                  placeholder="850+"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Volume Transacted
                </label>
                <input
                  type="text"
                  value={cmsData.stats_volume}
                  onChange={e => setCmsData({ ...cmsData, stats_volume: e.target.value })}
                  placeholder="₹250+ Cr"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
            </div>
          </div>

          {/* Agency Details */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', color: '#166534', display: 'grid', placeItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Agency Contact & Footer Info</h2>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Details used in site header, WhatsApp links, and office address cards.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Agency Official Name
                </label>
                <input
                  type="text"
                  value={cmsData.agency_name}
                  onChange={e => setCmsData({ ...cmsData, agency_name: e.target.value })}
                  placeholder="KARMA Real Estate"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Official Phone (Calls)
                </label>
                <input
                  type="text"
                  value={cmsData.agency_phone}
                  onChange={e => setCmsData({ ...cmsData, agency_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Official WhatsApp Number
                </label>
                <input
                  type="text"
                  value={cmsData.agency_whatsapp}
                  onChange={e => setCmsData({ ...cmsData, agency_whatsapp: e.target.value })}
                  placeholder="+919876543210"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Official Inquiries Email
                </label>
                <input
                  type="email"
                  value={cmsData.agency_email}
                  onChange={e => setCmsData({ ...cmsData, agency_email: e.target.value })}
                  placeholder="info@karmarealestate.in"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
            </div>

            <div className="fld">
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Office Physical Address
              </label>
              <textarea
                rows="2"
                value={cmsData.agency_address}
                onChange={e => setCmsData({ ...cmsData, agency_address: e.target.value })}
                placeholder="KARMA Tower, 2nd Floor, South Bazar, Talap Road, Kannur, Kerala 670002"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, resize: 'vertical' }}
              />
            </div>
          </div>
        </form>

        {/* Right Column: Live Mockup / Preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '12px 16px', background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Live Hero Preview (How it looks to visitors)</span>
              <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>LIVE</span>
            </div>

            <div style={{ padding: '28px 24px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
              {cmsData.hero_announcement && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700, marginBottom: 14 }}>
                  <span>{cmsData.hero_announcement}</span>
                </div>
              )}

              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.25, margin: '0 0 10px' }}>
                {cmsData.hero_headline || 'Hero Headline'}
              </h3>

              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 20px' }}>
                {cmsData.hero_subheadline || 'Hero Subheadline'}
              </p>

              {/* Action Buttons Mock */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {['Buy', 'Rent', 'Lease', 'Sell'].map(btn => (
                  <span key={btn} style={{ padding: '6px 14px', borderRadius: 99, background: '#fff', border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                    {btn}
                  </span>
                ))}
              </div>

              {/* Stats Strip Mock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#065f46' }}>{cmsData.stats_properties}</div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>Properties</div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#065f46' }}>{cmsData.stats_clients}</div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>Clients</div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#065f46' }}>{cmsData.stats_volume}</div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>Volume</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 12.5, color: '#1e40af', lineHeight: 1.5 }}>
            💡 <b>Instant Sync:</b> Click "Save Changes" above to update the live public website and metadata.
          </div>
        </div>
      </div>
    </div>
  );
}
