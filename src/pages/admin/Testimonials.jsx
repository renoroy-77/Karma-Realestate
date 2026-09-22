import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=60'
];

const BG_PRESETS = [
  { label: 'Kannur Modern Villa', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Kerala Coastal Estate', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Malabar Luxury Residence', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Hilltop Horizon Villa', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Contemporary Glass House', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80' }
];

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showBgUrlInput, setShowBgUrlInput] = useState(false);
  const fileInputRef = useRef(null);
  const bgFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    client_name: '',
    client_role: '',
    content: '',
    rating: 5,
    photo_url: AVATAR_PRESETS[0],
    bg_image: '',
    is_active: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/testimonials');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setShowUrlInput(false);
    setShowBgUrlInput(false);
    setFormData({
      client_name: '',
      client_role: '',
      content: '',
      rating: 5,
      photo_url: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      bg_image: '',
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setModalMode('edit');
    setEditingId(t.id);
    setShowUrlInput(false);
    setShowBgUrlInput(false);
    setFormData({
      client_name: t.client_name,
      client_role: t.client_role || '',
      content: t.content,
      rating: t.rating || 5,
      photo_url: t.photo_url || AVATAR_PRESETS[0],
      bg_image: t.bg_image || '',
      is_active: Boolean(t.is_active)
    });
    setShowModal(true);
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    // Instant local preview
    const tempUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, photo_url: tempUrl }));

    const data = new FormData();
    data.append('avatar', file);

    try {
      setUploadingAvatar(true);
      const res = await api.post('/admin/testimonials/upload-avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success && res.data.url) {
        setFormData(prev => ({ ...prev, photo_url: res.data.url }));
        toast.success('Avatar photo uploaded successfully!');
      }
    } catch (err) {
      console.error('Avatar upload failed', err);
      toast.error('Failed to upload avatar photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBgFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, AVIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Background image size must be less than 10MB.');
      return;
    }

    // Instant local preview
    const tempUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, bg_image: tempUrl }));

    const data = new FormData();
    data.append('bg_image', file);

    try {
      setUploadingBg(true);
      const res = await api.post('/admin/testimonials/upload-bg', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success && res.data.url) {
        setFormData(prev => ({ ...prev, bg_image: res.data.url }));
        toast.success('Card background photo uploaded successfully!');
      }
    } catch (err) {
      console.error('Background upload failed', err);
      toast.error('Failed to upload background image. Please try again.');
    } finally {
      setUploadingBg(false);
      if (bgFileInputRef.current) bgFileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.content) {
      toast.error('Please fill in client name and review content.');
      return;
    }

    try {
      setSaving(true);
      if (modalMode === 'add') {
        const res = await api.post('/admin/testimonials', formData);
        if (res.data.success) {
          setItems(prev => [res.data.data, ...prev]);
          toast.success('Testimonial published successfully!');
        }
      } else {
        const res = await api.put(`/admin/testimonials/${editingId}`, formData);
        if (res.data.success) {
          setItems(prev => prev.map(item => item.id === editingId ? res.data.data : item));
          toast.success('Testimonial updated successfully!');
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving testimonial', err);
      toast.error('Failed to save testimonial. Please check inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t));
      await api.patch(`/admin/testimonials/${id}/toggle`);
      toast.success('Testimonial visibility updated');
    } catch (err) {
      console.error('Failed to toggle status', err);
      toast.error('Failed to update status');
      fetchTestimonials();
    }
  };

  const handleDelete = (id) => {
    toast('Delete this testimonial?', {
      description: 'This review will be permanently removed from the website.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            setItems(prev => prev.filter(t => t.id !== id));
            await api.delete(`/admin/testimonials/${id}`);
            toast.success('Testimonial deleted');
          } catch (err) {
            console.error('Failed to delete testimonial', err);
            toast.error('Failed to delete testimonial');
            fetchTestimonials();
          }
        }
      },
      cancel: { label: 'Cancel' },
      duration: 6000
    });
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Client Testimonials & Reviews
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Manage verified client reviews and NRI feedback displayed on the public homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            background: '#065f46',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(6, 95, 70, 0.25)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Testimonial</span>
        </button>
      </div>


      {/* Grid of Testimonial Cards */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
          Loading testimonials...
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No Testimonials Yet</h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Click the button below to add your first verified client review.</p>
          <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
            + Add First Testimonial
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {items.map(t => (
            <div
              key={t.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                opacity: t.is_active ? 1 : 0.65,
                transition: 'all 0.2s'
              }}
            >
              <div>
                {/* Background image preview banner if set */}
                {t.bg_image && (
                  <div style={{
                    position: 'relative',
                    height: 76,
                    borderRadius: 10,
                    overflow: 'hidden',
                    marginBottom: 14,
                    backgroundImage: `url(${t.bg_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.2))' }} />
                    <span style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#ffffff',
                      background: 'rgba(0,0,0,0.55)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      backdropFilter: 'blur(4px)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      🖼️ Card Background Active
                    </span>
                  </div>
                )}

                {/* Card Header: Client Info & Status Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={t.photo_url || AVATAR_PRESETS[0]}
                      alt={t.client_name}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ecfdf5' }}
                    />
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.client_name}</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>{t.client_role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(t.id)}
                    title={t.is_active ? 'Click to deactivate' : 'Click to activate on homepage'}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: t.is_active ? '#dcfce7' : '#f1f5f9',
                      color: t.is_active ? '#15803d' : '#64748b',
                      transition: 'all 0.15s'
                    }}
                  >
                    {t.is_active ? '● Active' : '○ Hidden'}
                  </button>
                </div>

                {/* Rating Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 12, color: '#f59e0b', fontSize: 14 }}>
                  {[...Array(5)].map((_, idx) => (
                    <span key={idx}>{idx < (t.rating || 5) ? '★' : '☆'}</span>
                  ))}
                </div>

                {/* Review Content */}
                <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
                  "{t.content}"
                </p>
              </div>

              {/* Card Footer: Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => openEditModal(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    color: '#e11d48',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="overlay" onClick={() => !saving && setShowModal(false)} style={{ zIndex: 100 }}>
          <div className="admin-prop-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: '#ffffff', zIndex: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                {modalMode === 'add' ? 'Add Client Testimonial' : 'Edit Testimonial'}
              </h2>
              <button
                type="button"
                onClick={() => !saving && setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Client Full Name *
                </label>
                <input
                  required
                  value={formData.client_name}
                  onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="e.g. Faisal Mohammed"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Client Role / Location / Company *
                </label>
                <input
                  required
                  value={formData.client_role}
                  onChange={e => setFormData({ ...formData, client_role: e.target.value })}
                  placeholder="e.g. NRI Business Owner, Abu Dhabi"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Rating (1 to 5 Stars)
                </label>
                <select
                  value={formData.rating}
                  onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                >
                  <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                  <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                  <option value="3">★★★☆☆ (3 Stars - Average)</option>
                </select>
              </div>

              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Testimonial Quote / Review *
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Describe the client's experience purchasing land or villa in Kannur..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, resize: 'vertical' }}
                />
              </div>

              {/* Avatar Picker with File Upload */}
              <div className="fld">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarFileSelect}
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                    Client Avatar Photo
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{ background: 'none', border: 'none', color: '#065f46', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {showUrlInput ? 'Hide URL input' : 'Or enter image link'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1', marginBottom: 10 }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to upload new photo"
                    style={{
                      position: 'relative',
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      flexShrink: 0,
                      overflow: 'hidden',
                      border: '2px solid #065f46',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                  >
                    <img
                      src={formData.photo_url || AVATAR_PRESETS[0]}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          background: '#065f46',
                          color: '#ffffff',
                          fontSize: 12.5,
                          fontWeight: 600,
                          border: 'none',
                          cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 1px 3px rgba(6,95,70,0.2)'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        {uploadingAvatar ? 'Uploading Image...' : 'Upload Photo from Device'}
                      </button>

                      <span style={{ fontSize: 11.5, color: '#64748b' }}>
                        PNG, JPG or WebP (max 5MB)
                      </span>
                    </div>
                  </div>
                </div>

                {showUrlInput && (
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="url"
                      value={formData.photo_url || ''}
                      onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Quick presets:</span>
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      onClick={() => setFormData({ ...formData, photo_url: preset })}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: formData.photo_url === preset ? '2px solid #065f46' : '1px solid #cbd5e1',
                        transform: formData.photo_url === preset ? 'scale(1.15)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Card Background Photo Picker */}
              <div className="fld" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <input
                  type="file"
                  ref={bgFileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
                  onChange={handleBgFileSelect}
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block' }}>
                      Card Background Photo (Featured on Homepage)
                    </label>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      Adds full villa background with dark overlay
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBgUrlInput(!showBgUrlInput)}
                    style={{ background: 'none', border: 'none', color: '#065f46', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {showBgUrlInput ? 'Hide URL input' : 'Or enter image link'}
                  </button>
                </div>

                {/* Preview Banner */}
                {formData.bg_image ? (
                  <div style={{
                    position: 'relative',
                    height: 110,
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundImage: `url(${formData.bg_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: 10,
                    border: '1px solid #cbd5e1'
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))' }} />
                    <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ color: '#fff', fontSize: 11.5, maxWidth: '70%', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>Card Preview</div>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.9 }}>
                          "{formData.content ? formData.content.slice(0, 55) + '...' : 'Client review preview...'}"
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => bgFileInputRef.current?.click()}
                          disabled={uploadingBg}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.95)',
                            border: 'none',
                            color: '#0f172a',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {uploadingBg ? 'Uploading...' : 'Change'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, bg_image: '' }))}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'rgba(239,68,68,0.85)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => bgFileInputRef.current?.click()}
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1.5px dashed #cbd5e1',
                      textAlign: 'center',
                      cursor: 'pointer',
                      marginBottom: 10,
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#065f46' }}>
                        {uploadingBg ? 'Uploading Background...' : 'Upload Card Background Photo'}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Recommended: High quality villa or property photo (max 10MB)
                      </span>
                    </div>
                  </div>
                )}

                {showBgUrlInput && (
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="url"
                      value={formData.bg_image || ''}
                      onChange={e => setFormData({ ...formData, bg_image: e.target.value })}
                      placeholder="https://example.com/luxury-villa.jpg"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                )}

                {/* Kerala Luxury Presets */}
                <div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 6 }}>
                    Quick presets:
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {BG_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, bg_image: preset.url })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: formData.bg_image === preset.url ? '#ecfdf5' : '#f1f5f9',
                          border: formData.bg_image === preset.url ? '1.5px solid #065f46' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 500,
                          color: formData.bg_image === preset.url ? '#065f46' : '#475569'
                        }}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          style={{ width: 16, height: 16, borderRadius: 3, objectFit: 'cover' }}
                        />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="testi-active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: '#065f46' }}
                />
                <label htmlFor="testi-active" style={{ fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Publish on public homepage immediately
                </label>
              </div>

              <div style={{ position: 'sticky', bottom: -20, background: '#ffffff', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, paddingTop: 14, paddingBottom: 4, borderTop: '1px solid #f1f5f9', zIndex: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  style={{ padding: '8px 16px', borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    background: '#065f46',
                    border: 'none',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Create Testimonial' : 'Update Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
