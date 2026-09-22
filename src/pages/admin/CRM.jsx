import { useContext, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppDataContext, formatIndianPrice } from '../../context/AppDataContext';
import { toast } from 'sonner';
import api from '../../lib/api';

function statusPill(s) {
  const m = {
    'New': 'blue', 'new': 'blue',
    'Contacted': 'amber', 'contacted': 'amber',
    'Interested': 'green', 'interested': 'green',
    'Not Interested': 'gray', 'not_interested': 'gray',
    'Closed': 'purple', 'closed': 'purple',
    'Available': 'green', 'available': 'green',
    'Under Negotiation': 'amber', 'under_negotiation': 'amber',
    'Sold': 'red', 'sold': 'red',
    'Rented': 'red', 'rented': 'red',
    'Leased': 'red', 'leased': 'red',
    'Delisted': 'gray', 'delisted': 'gray',
    'pending': 'amber', 'Pending': 'amber',
    'confirmed': 'blue', 'Confirmed': 'blue',
    'completed': 'green', 'Completed': 'green',
    'cancelled': 'gray', 'Cancelled': 'gray'
  };
  const label = typeof s === 'string' ? (s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')) : s;
  return <span className={`pill ${m[s] || 'gray'}`}><i></i>{label}</span>;
}

export default function CRM() {
  const { leads, updateLeadStatus, addLeadNote, mergeLeads } = useContext(AppDataContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'leads' | 'tours'
  const initialTab = searchParams.get('tab') === 'tours' ? 'tours' : 'leads';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Leads Filter & State
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Site Visits State
  const [siteVisits, setSiteVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [visitFilter, setVisitFilter] = useState('all');

  // Merge Leads State
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [primaryLeadId, setPrimaryLeadId] = useState('');
  const [duplicateLeadId, setDuplicateLeadId] = useState('');
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');

  const F = ['All', 'New', 'Contacted', 'Interested', 'Not Interested', 'Closed'];
  const VISIT_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  // Fetch Site Visits
  const fetchVisits = () => {
    setLoadingVisits(true);
    api.get('/admin/site-visits')
      .then(res => {
        if (res.data.success) {
          setSiteVisits(res.data.data);
        }
      })
      .catch(err => {
        console.error('Failed to load site visits', err);
      })
      .finally(() => setLoadingVisits(false));
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'tours' ? { tab: 'tours' } : {});
  };

  const handleUpdateVisitStatus = async (visitId, newStatus) => {
    try {
      await api.patch(`/admin/site-visits/${visitId}/status`, { status: newStatus });
      setSiteVisits(prev => prev.map(v => v.id === visitId ? { ...v, booking_status: newStatus } : v));
      toast.success(`Tour request status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update tour request status');
    }
  };

  const handleDeleteVisit = (visitId) => {
    toast('Delete this tour request?', {
      description: 'This booking request will be permanently removed.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await api.delete(`/admin/site-visits/${visitId}`);
            setSiteVisits(prev => prev.filter(v => v.id !== visitId));
            toast.success('Tour request removed.');
          } catch (err) {
            toast.error('Failed to delete tour request');
          }
        }
      },
      cancel: { label: 'Cancel' },
      duration: 6000
    });
  };

  let list = leads.filter(l => filter === 'All' || l.status === filter);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(l => 
      l.name?.toLowerCase().includes(q) || 
      l.phone?.includes(q) || 
      l.email?.toLowerCase().includes(q) ||
      l.loc?.toLowerCase().includes(q) ||
      (l.props && l.props.join(' ').toLowerCase().includes(q))
    );
  }

  let filteredVisits = siteVisits.filter(v => visitFilter === 'all' || v.booking_status === visitFilter);
  if (query) {
    const q = query.toLowerCase();
    filteredVisits = filteredVisits.filter(v =>
      v.visitor_name?.toLowerCase().includes(q) ||
      v.visitor_phone?.includes(q) ||
      v.visitor_email?.toLowerCase().includes(q) ||
      v.property?.title?.toLowerCase().includes(q) ||
      v.property?.locality?.toLowerCase().includes(q)
    );
  }

  const handleStatusChange = async (newStatus) => {
    if (!selectedLead) return;
    try {
      await updateLeadStatus(selectedLead.id, newStatus);
      setSelectedLead(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      toast.error('Failed to update lead status: ' + err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLead) return;
    setAddingNote(true);
    try {
      await addLeadNote(selectedLead.id, newNote.trim());
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSelectedLead(prev => ({
        ...prev,
        log: [{ t: `Note: ${newNote.trim()}`, w: now }, ...(prev.log || [])]
      }));
      setNewNote('');
    } catch (err) {
      toast.error('Failed to add note: ' + err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    if (!primaryLeadId || !duplicateLeadId) {
      setMergeError('Please select both a primary lead and a duplicate lead.');
      return;
    }
    if (primaryLeadId === duplicateLeadId) {
      setMergeError('Primary and duplicate lead cannot be the same record.');
      return;
    }

    setMerging(true);
    setMergeError('');
    try {
      await mergeLeads(parseInt(primaryLeadId), parseInt(duplicateLeadId));
      setShowMergeModal(false);
      setSelectedLead(null);
    } catch (err) {
      setMergeError(err.message || 'Failed to merge leads.');
    } finally {
      setMerging(false);
    }
  };

  const pendingVisitsCount = siteVisits.filter(v => v.booking_status === 'pending').length;

  return (
    <div className="admin-theme">
      {/* Top Main Tab Switcher */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 14 }}>
        <button
          onClick={() => handleTabChange('leads')}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            background: activeTab === 'leads' ? 'var(--blue)' : '#f8fafc',
            color: activeTab === 'leads' ? '#fff' : 'var(--ink)',
            border: activeTab === 'leads' ? '1px solid var(--blue)' : '1px solid var(--line)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <span>👥 All Leads & Inquiries</span>
          <span style={{ 
            background: activeTab === 'leads' ? 'rgba(255,255,255,0.25)' : 'var(--line)', 
            color: activeTab === 'leads' ? '#fff' : 'var(--ink-2)',
            padding: '2px 8px', 
            borderRadius: 99, 
            fontSize: 11.5,
            fontWeight: 800 
          }}>
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('tours')}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            background: activeTab === 'tours' ? 'var(--blue)' : '#f8fafc',
            color: activeTab === 'tours' ? '#fff' : 'var(--ink)',
            border: activeTab === 'tours' ? '1px solid var(--blue)' : '1px solid var(--line)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <span>📅 Tour & Site Visit Requests</span>
          <span style={{ 
            background: activeTab === 'tours' ? 'rgba(255,255,255,0.25)' : (pendingVisitsCount > 0 ? '#fef3c7' : 'var(--line)'), 
            color: activeTab === 'tours' ? '#fff' : (pendingVisitsCount > 0 ? '#b45309' : 'var(--ink-2)'),
            padding: '2px 8px', 
            borderRadius: 99, 
            fontSize: 11.5, 
            fontWeight: 800 
          }}>
            {siteVisits.length} {pendingVisitsCount > 0 && `(${pendingVisitsCount} new)`}
          </span>
        </button>
      </div>

      {/* TAB 1: ALL LEADS PIPELINE */}
      {activeTab === 'leads' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div className="chip-row">
              {F.map(f => (
                <button 
                  key={f}
                  className={`fchip ${filter === f ? 'on' : ''}`} 
                  onClick={() => setFilter(f)}
                >
                  {f}{f === 'All' ? ` · ${leads.length}` : ` · ${leads.filter(l => l.status === f).length}`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="search-in">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                </svg>
                <input 
                  placeholder="Search name, phone, property..." 
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                />
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setMergeError('');
                  setPrimaryLeadId(leads[0]?.id || '');
                  setDuplicateLeadId(leads[1]?.id || '');
                  setShowMergeModal(true);
                }}
              >
                Merge Leads
              </button>
            </div>
          </div>
          
          <div className="panel">
            {list.length ? (
              <div className="table-scroll">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>First seen</th>
                      <th>Properties viewed / interested</th>
                      <th>Source</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(l => (
                      <tr key={l.id} onClick={() => setSelectedLead(l)} style={{ cursor: 'pointer' }}>
                        <td className="td-main">
                          <b>{l.name}</b>
                          <span>{l.phone} {l.email ? `· ${l.email}` : ''} {l.loc ? `· ${l.loc}` : ''}</span>
                        </td>
                        <td style={{ fontSize: '12.5px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                          {l.first}
                        </td>
                        <td style={{ fontSize: '12.5px', color: 'var(--ink-3)' }}>
                          {l.props && l.props.length > 0 ? (
                            <>
                              {l.props[0]}
                              {l.props.length > 1 && <span style={{ color: 'var(--ink-2)' }}> +{l.props.length - 1} more</span>}
                            </>
                          ) : (
                            <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>General inquiry</span>
                          )}
                        </td>
                        <td>
                          <span className={`pill ${l.src === 'Site visit request' ? 'amber' : 'gray'}`}>
                            {l.src}
                          </span>
                        </td>
                        <td>{statusPill(l.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                <b>No leads match</b>
                Try a different status filter or search term.
              </div>
            )}
          </div>
          
          <p style={{ fontSize: '12px', color: 'var(--ink-2)', padding: '0 4px' }}>
            Leads appear here the moment a customer requests a site visit, submits a contact form, or verifies OTP. Click any row to view details, update pipeline status, or add internal notes.
          </p>
        </>
      )}

      {/* TAB 2: TOUR & SITE VISIT REQUESTS */}
      {activeTab === 'tours' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div className="chip-row">
              {VISIT_FILTERS.map(vf => {
                const count = vf === 'all' ? siteVisits.length : siteVisits.filter(v => v.booking_status === vf).length;
                return (
                  <button
                    key={vf}
                    className={`fchip ${visitFilter === vf ? 'on' : ''}`}
                    onClick={() => setVisitFilter(vf)}
                  >
                    {vf.charAt(0).toUpperCase() + vf.slice(1)} · {count}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="search-in">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                </svg>
                <input 
                  placeholder="Search visitor or property..." 
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                />
              </div>
              <button className="btn btn-outline btn-sm" onClick={fetchVisits} disabled={loadingVisits}>
                {loadingVisits ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="panel">
            {filteredVisits.length ? (
              <div className="table-scroll">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Visitor Details</th>
                      <th>Property Requested</th>
                      <th>Preferred Date & Slot</th>
                      <th>Notes / Requirements</th>
                      <th>Booking Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisits.map(visit => {
                      const cleanPhone = (visit.visitor_phone || '').replace(/\D/g, '');
                      const waNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                      const property = visit.property;
                      const dateStr = visit.preferred_date ? new Date(visit.preferred_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : 'Flexible';

                      return (
                        <tr key={visit.id}>
                          <td className="td-main">
                            <b>{visit.visitor_name}</b>
                            <span>{visit.visitor_phone}</span>
                            {visit.visitor_email && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{visit.visitor_email}</span>}
                          </td>

                          <td>
                            {property ? (
                              <div>
                                <Link 
                                  to={`/kannur/${(property.type || 'house').toLowerCase()}/${property.slug || property.id}`}
                                  target="_blank"
                                  style={{ fontWeight: 700, color: 'var(--blue)', textDecoration: 'none' }}
                                >
                                  {property.title}
                                </Link>
                                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>
                                  📍 {property.locality || 'Kannur'} · {property.price ? formatIndianPrice(property.price) : ''}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--ink-3)' }}>Property #{visit.property_id}</span>
                            )}
                          </td>

                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                              📅 {dateStr}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>
                              ⏰ {visit.preferred_time_slot || 'Standard hours'}
                            </div>
                          </td>

                          <td style={{ maxWidth: 220, fontSize: 12.5, color: 'var(--ink-2)' }}>
                            {visit.notes ? visit.notes : <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>No additional notes</span>}
                          </td>

                          <td>
                            <select
                              value={visit.booking_status || 'pending'}
                              onChange={e => handleUpdateVisitStatus(visit.id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                fontSize: 12.5,
                                fontWeight: 700,
                                border: '1px solid var(--line)',
                                background: visit.booking_status === 'confirmed' ? '#eff6ff' : (visit.booking_status === 'pending' ? '#fffbeb' : '#f8fafc'),
                                color: visit.booking_status === 'confirmed' ? '#1d4ed8' : (visit.booking_status === 'pending' ? '#b45309' : '#334155')
                              }}
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="confirmed">✓ Confirmed</option>
                              <option value="completed">★ Completed</option>
                              <option value="cancelled">✕ Cancelled</option>
                            </select>
                          </td>

                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              {cleanPhone && (
                                <>
                                  <a
                                    href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Hello ${visit.visitor_name}, regarding your KARMA Real Estate site visit request for ${property?.title || 'the property'}...`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm"
                                    style={{ background: '#25D366', color: '#fff', padding: '5px 10px', fontSize: 12, textDecoration: 'none' }}
                                    title="Chat on WhatsApp"
                                  >
                                    WhatsApp
                                  </a>
                                  <a
                                    href={`tel:+${cleanPhone}`}
                                    className="btn btn-blue btn-sm"
                                    style={{ padding: '5px 10px', fontSize: 12, textDecoration: 'none' }}
                                    title="Call Customer"
                                  >
                                    Call
                                  </a>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteVisit(visit.id)}
                                className="icon-btn"
                                style={{ color: 'var(--red)', border: 'none', background: 'transparent' }}
                                title="Delete Tour Request"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                <b>No tour bookings found</b>
                {loadingVisits ? 'Loading site visit requests...' : 'When visitors book an in-person site visit, their scheduled appointments appear here.'}
              </div>
            )}
          </div>
        </>
      )}

      {/* Lead Detail Drawer - Enhanced Luxury CRM Design */}
      {selectedLead && (
        <div className="drawer-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="drawer" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', background: '#f8fafc' }} onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-hd" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '18px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  fontSize: 12, 
                  fontWeight: 700, 
                  padding: '3px 8px', 
                  borderRadius: 6,
                  fontFamily: 'monospace'
                }}>
                  LEAD #{selectedLead.id}
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0f172a' }}>Lead Profile</h3>
              </div>
              <button 
                className="icon-btn" 
                onClick={() => setSelectedLead(null)}
                style={{ width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="drawer-bd" style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Executive Lead Profile Card */}
              <div style={{ 
                background: '#ffffff', 
                borderRadius: 16, 
                padding: '20px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ 
                    width: 58, 
                    height: 58, 
                    borderRadius: 16, 
                    background: 'linear-gradient(135deg, #18181B 0%, #C5A059 100%)', 
                    color: '#ffffff', 
                    display: 'grid', 
                    placeItems: 'center', 
                    fontSize: 22, 
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(197, 160, 89, 0.25)'
                  }}>
                    {selectedLead.name?.charAt(0)?.toUpperCase() || 'L'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        {selectedLead.name}
                      </h2>
                      <span style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        background: '#ecfdf5', 
                        color: '#059669', 
                        padding: '2px 8px', 
                        borderRadius: 99, 
                        border: '1px solid #a7f3d0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        ✓ Verified Lead
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                      {/* Phone with copy */}
                      {selectedLead.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 12px', borderRadius: 8, border: '1px solid #edf2f7' }}>
                          <a 
                            href={`tel:${selectedLead.phone}`} 
                            style={{ color: '#0f172a', fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <span>📞</span> {selectedLead.phone}
                          </a>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedLead.phone);
                              toast.success('Phone copied to clipboard');
                            }}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 11.5, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Copy
                          </button>
                        </div>
                      )}

                      {/* Email with copy */}
                      {selectedLead.email && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 12px', borderRadius: 8, border: '1px solid #edf2f7' }}>
                          <a 
                            href={`mailto:${selectedLead.email}`} 
                            style={{ color: '#0f172a', fontWeight: 500, fontSize: 12.5, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            <span>✉️</span> {selectedLead.email}
                          </a>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedLead.email);
                              toast.success('Email copied to clipboard');
                            }}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 11.5, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, fontSize: 12, color: '#64748b' }}>
                      {selectedLead.loc && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                          📍 {selectedLead.loc}
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                        🌐 Source: {selectedLead.src || 'Direct Web'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pipeline Stage Management */}
              <div style={{ background: '#ffffff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Pipeline Stage
                  </label>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>First seen: {selectedLead.first || 'Recently'}</span>
                </div>

                {/* Stage Pills Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {F.slice(1).map(stage => {
                    const isCurrent = selectedLead.status === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => handleStatusChange(stage)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          border: isCurrent ? '2px solid #C5A059' : '1px solid #e2e8f0',
                          background: isCurrent ? 'linear-gradient(135deg, #18181B 0%, #27272A 100%)' : '#f8fafc',
                          color: isCurrent ? '#C5A059' : '#475569',
                          boxShadow: isCurrent ? '0 2px 8px rgba(197, 160, 89, 0.2)' : 'none'
                        }}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Properties of Interest Section */}
              <div style={{ background: '#ffffff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Properties of Interest
                  </h4>
                  <span style={{ fontSize: 11.5, background: '#f1f5f9', padding: '2px 8px', borderRadius: 99, fontWeight: 700, color: '#64748b' }}>
                    {selectedLead.props?.length || 0}
                  </span>
                </div>

                {selectedLead.props && selectedLead.props.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedLead.props.map((p, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          padding: '10px 14px', 
                          borderRadius: 10, 
                          background: '#f8fafc', 
                          border: '1px solid #e2e8f0', 
                          fontSize: 13, 
                          color: '#0f172a', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}
                      >
                        <span style={{ fontSize: 16 }}>🏡</span>
                        <span style={{ flex: 1 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 12px', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>🏠</div>
                    <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                      No specific properties attached to this lead yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Team Notes & Interaction Logger */}
              <div style={{ background: '#ffffff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, margin: '0 0 12px 0' }}>
                  Add Team Note
                </h4>
                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Log call summary, budget, visit notes..."
                    style={{ 
                      flex: 1, 
                      padding: '10px 14px', 
                      borderRadius: 10, 
                      border: '1px solid #cbd5e1', 
                      fontSize: 13,
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={addingNote || !newNote.trim()}
                    style={{
                      background: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
                      color: '#C5A059',
                      border: '1px solid #C5A059',
                      borderRadius: 10,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: addingNote || !newNote.trim() ? 'not-allowed' : 'pointer',
                      opacity: addingNote || !newNote.trim() ? 0.6 : 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {addingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </form>
              </div>

              {/* Activity & Timeline Feed */}
              <div style={{ background: '#ffffff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, margin: '0 0 14px 0' }}>
                  Activity Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selectedLead.log && selectedLead.log.length > 0 ? (
                    selectedLead.log.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 8, 
                          background: item.t.startsWith('Note:') ? '#fef3c7' : '#ecfdf5', 
                          display: 'grid', 
                          placeItems: 'center', 
                          fontSize: 14, 
                          flexShrink: 0 
                        }}>
                          {item.t.startsWith('Note:') ? '📝' : '🎯'}
                        </div>
                        <div style={{ flex: 1, background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #edf2f7' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.t}</div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>{item.w}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', display: 'grid', placeItems: 'center', fontSize: 14, flexShrink: 0 }}>
                        🎯
                      </div>
                      <div style={{ flex: 1, background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #edf2f7' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Lead Captured</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Captured via {selectedLead.src || 'Web OTP Verification'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{selectedLead.first || 'Recently'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Actions Footer */}
            <div className="drawer-ft" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedLead.phone && (() => {
                const cleanPhone = (selectedLead.phone || '').replace(/[^0-9]/g, '');
                const waNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const callNum = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <a
                      href={`https://wa.me/${waNum}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ 
                        background: '#25D366', 
                        color: '#ffffff', 
                        fontWeight: 700, 
                        fontSize: 14, 
                        padding: '12px 16px', 
                        borderRadius: 12, 
                        textAlign: 'center', 
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.01a10 10 0 0 0-8.52 15.27L2 22l4.87-1.46a10 10 0 1 0 5.14-18.53zm0 18A8 8 0 0 1 7.2 18.9l-.35-.2-3.6 1.08 1.1-3.5-.2-.36A8 8 0 1 1 12.01 20zm4.27-5.83c-.23-.12-1.38-.68-1.59-.76-.22-.08-.38-.12-.54.12s-.6 .76-.74.92c-.14.16-.27.18-.5.06a6.56 6.56 0 0 1-1.92-1.18 7.2 7.2 0 0 1-1.33-1.66c-.14-.24-.01-.37.1-.49.1-.11.23-.27.35-.4a1.6 1.6 0 0 0 .15-.25c.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.47-.4-.4-.54-.41-.14 0-.3-.01-.46-.01a.89.89 0 0 0-.64.3c-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.7 2.6 4.12 3.64 1.48.64 2.15.7 2.94.59.56-.08 1.38-.56 1.57-1.1.2-.54.2-.1.14-.11z"/></svg>
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${callNum}`}
                      style={{ 
                        background: '#0071E3', 
                        color: '#ffffff', 
                        fontWeight: 700, 
                        fontSize: 14, 
                        padding: '12px 16px', 
                        borderRadius: 12, 
                        textAlign: 'center', 
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Call Lead
                    </a>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryLeadId(selectedLead.id);
                    setDuplicateLeadId('');
                    setMergeError('');
                    setShowMergeModal(true);
                  }}
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Merge Duplicate...
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merge Duplicate Leads Modal */}
      {showMergeModal && (
        <div className="overlay" onClick={() => !merging && setShowMergeModal(false)} style={{ zIndex: 100 }}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-hd">
              <b>Merge Duplicate Leads</b>
              <button className="modal-x" onClick={() => !merging && setShowMergeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleMergeSubmit}>
              <div className="modal-bd">
                <p style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 16, lineHeight: 1.5 }}>
                  Consolidate activities, properties viewed, site visits, and notes from a duplicate lead into the primary lead record. The duplicate record will be removed.
                </p>

                {mergeError && (
                  <div style={{ background: 'var(--red-soft)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                    {mergeError}
                  </div>
                )}

                <div className="fld">
                  <label>Primary Lead (Record to Keep) *</label>
                  <select
                    required
                    value={primaryLeadId}
                    onChange={e => setPrimaryLeadId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select Primary Lead...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>
                        #{l.id} · {l.name} ({l.phone || l.email || 'No phone'}) - {l.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fld">
                  <label>Duplicate Lead (Record to Merge & Delete) *</label>
                  <select
                    required
                    value={duplicateLeadId}
                    onChange={e => setDuplicateLeadId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select Duplicate Lead...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id} disabled={String(l.id) === String(primaryLeadId)}>
                        #{l.id} · {l.name} ({l.phone || l.email || 'No phone'}) - {l.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f9fafb' }}>
                <button type="button" className="btn btn-outline" disabled={merging} onClick={() => setShowMergeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue" disabled={merging || !primaryLeadId || !duplicateLeadId}>
                  {merging ? 'Merging...' : 'Merge Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
