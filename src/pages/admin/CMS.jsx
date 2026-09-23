import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function CMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRefs = useRef({});

  const [cmsData, setCmsData] = useState({
    hero_headline: 'Find Your Perfect Property in Kerala',
    hero_subheadline: 'Discover 1000+ verified properties across Kerala. Search by location, budget & lifestyle.',
    hero_announcement: '🔥 Kannur Airport Corridor Commercial Lands Available',
    popular_locations: [
      { name: 'Payyanur', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80' },
      { name: 'Thalassery', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=200&q=80' },
      { name: 'Taliparamba', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=200&q=80' },
      { name: 'Iritty', image: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=200&q=80' },
      { name: 'Mattannur', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=200&q=80' },
      { name: 'Kannur City', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=200&q=80' },
      { name: 'Payyambalam', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80' }
    ],
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
        const d = res.data.data;
        setCmsData(prev => ({
          ...prev,
          ...d,
          popular_locations: Array.isArray(d.popular_locations) && d.popular_locations.length > 0
            ? d.popular_locations
            : prev.popular_locations
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
        toast.success('Hero and popular locations updated live on website!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error saving settings', err);
      const msg = err.response?.data?.message || 'Failed to save settings. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLocationChange = (idx, field, value) => {
    setCmsData(prev => {
      const updated = [...(prev.popular_locations || [])];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, popular_locations: updated };
    });
  };

  const handleAddLocation = () => {
    setCmsData(prev => ({
      ...prev,
      popular_locations: [
        ...(prev.popular_locations || []),
        {
          name: 'New Location',
          image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80'
        }
      ]
    }));
    toast.info('Added new location card. Configure name and photo, then click Save.');
  };

  const handleRemoveLocation = (idx) => {
    setCmsData(prev => {
      const updated = prev.popular_locations.filter((_, i) => i !== idx);
      return { ...prev, popular_locations: updated };
    });
    toast.info('Location removed.');
  };

  const handleLocationPhotoUpload = async (idx, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB.');
      return;
    }

    // Instant local preview
    const tempUrl = URL.createObjectURL(file);
    handleLocationChange(idx, 'image', tempUrl);

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingIndex(idx);
      const res = await api.post('/admin/settings/upload-location-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success && res.data.url) {
        handleLocationChange(idx, 'image', res.data.url);
        toast.success(`Photo uploaded for ${cmsData.popular_locations[idx]?.name || 'location'}!`);
      }
    } catch (err) {
      console.error('Location photo upload failed', err);
      toast.error('Failed to upload location photo. Please try again.');
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Content Management (CMS)
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Manage hero headlines, popular location cards, stats, and agency contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            background: saving ? '#6ee7b7' : '#065f46',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '11px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(6, 95, 70, 0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          {saving ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, color: '#065f46', fontSize: 14, fontWeight: 500, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#b91c1c', fontSize: 14, fontWeight: 500, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout: Editor & Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 1fr)', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Section 1: Hero Headlines */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6, 95, 70, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065f46' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Homepage Hero Headlines</h2>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Primary value proposition and announcement badge</span>
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
                placeholder="e.g. ✈️ Kannur Airport Corridor Commercial Lands Available"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>

          {/* Section 2: Popular Locations Management (Small Cards) */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Hero Popular Locations (Small Cards)</h2>
                  <span style={{ fontSize: 12.5, color: '#64748b' }}>Configure the small location cards and photos displayed in the hero section</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddLocation}
                style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Add Location</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(cmsData.popular_locations || []).map((loc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc'
                  }}
                >
                  {/* Photo Thumbnail & Upload Trigger */}
                  <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid #cbd5e1', background: '#e2e8f0' }}>
                    <img
                      src={loc.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80'}
                      alt={loc.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <input
                      type="file"
                      ref={el => (fileInputRefs.current[idx] = el)}
                      accept="image/png,image/jpeg,image/webp,image/jpg,image/avif"
                      style={{ display: 'none' }}
                      onChange={e => handleLocationPhotoUpload(idx, e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      disabled={uploadingIndex === idx}
                      title="Upload photo from device"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        border: 'none',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        opacity: 0.85,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {uploadingIndex === idx ? (
                        <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      )}
                    </button>
                  </div>

                  {/* Inputs: Name & Image URL */}
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>
                        Location Name
                      </label>
                      <input
                        type="text"
                        value={loc.name}
                        onChange={e => handleLocationChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Thalassery"
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>
                        Photo URL (or click thumbnail to upload)
                      </label>
                      <input
                        type="text"
                        value={loc.image}
                        onChange={e => handleLocationChange(idx, 'image', e.target.value)}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                      />
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(idx)}
                    title="Remove this location"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 6
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Agency Contact & Stats */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Agency Contact & Stats</h2>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Contact info and numbers shown across the website</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Properties Stat
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
                  Happy Clients Stat
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Agency Brand Name
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
              <span>Live Hero Preview (Original Clean Design)</span>
              <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>LIVE</span>
            </div>

            <div
              style={{
                padding: '28px 24px',
                background: '#ffffff',
                transition: 'background 0.3s ease'
              }}
            >
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

              {/* Popular Locations Mini Strip Mock */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Popular Locations
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {(cmsData.popular_locations || []).slice(0, 5).map((loc, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: 54,
                        height: 54,
                        borderRadius: 8,
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      <img
                        src={loc.image}
                        alt={loc.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%)' }} />
                      <span style={{ position: 'absolute', bottom: 3, left: 4, right: 4, color: '#fff', fontSize: 8.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {loc.name}
                      </span>
                    </div>
                  ))}
                </div>
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
