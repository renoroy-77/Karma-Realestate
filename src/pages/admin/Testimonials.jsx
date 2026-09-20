import { useState, useEffect } from 'react';
import api from '../../lib/api';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=60'
];

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    client_name: '',
    client_role: '',
    content: '',
    rating: 5,
    photo_url: AVATAR_PRESETS[0],
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
    setFormData({
      client_name: '',
      client_role: '',
      content: '',
      rating: 5,
      photo_url: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      client_name: item.client_name,
      client_role: item.client_role,
      content: item.content,
      rating: item.rating || 5,
      photo_url: item.photo_url || AVATAR_PRESETS[0],
      is_active: Boolean(item.is_active)
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.content) {
      alert('Please fill in client name and review content.');
      return;
    }

    try {
      setSaving(true);
      if (modalMode === 'add') {
        const res = await api.post('/admin/testimonials', formData);
        if (res.data.success) {
          setItems(prev => [res.data.data, ...prev]);
          setNotice('Testimonial added successfully!');
        }
      } else {
        const res = await api.put(`/admin/testimonials/${editingId}`, formData);
        if (res.data.success) {
          setItems(prev => prev.map(item => item.id === editingId ? res.data.data : item));
          setNotice('Testimonial updated successfully!');
        }
      }
      setShowModal(false);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      console.error('Error saving testimonial', err);
      alert('Failed to save testimonial. Please check inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t));
      await api.patch(`/admin/testimonials/${id}/toggle`);
    } catch (err) {
      console.error('Failed to toggle status', err);
      fetchTestimonials();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      setItems(prev => prev.filter(t => t.id !== id));
      await api.delete(`/admin/testimonials/${id}`);
      setNotice('Testimonial deleted.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error('Failed to delete testimonial', err);
      fetchTestimonials();
    }
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

      {notice && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 18px', borderRadius: 12, marginBottom: 20, fontSize: 13.5 }}>
          {notice}
        </div>
      )}

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
          <div className="admin-prop-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

            <form onSubmit={handleSave} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

              {/* Avatar Picker */}
              <div className="fld">
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Client Avatar Photo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <img
                    src={formData.photo_url || AVATAR_PRESETS[0]}
                    alt="Preview"
                    style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #065f46' }}
                  />
                  <input
                    type="url"
                    value={formData.photo_url || ''}
                    onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="Paste image URL or pick preset below"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
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
