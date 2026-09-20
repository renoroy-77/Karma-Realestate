import { useContext, useState } from 'react';
import { AppDataContext } from '../../context/AppDataContext';

function statusPill(s) {
  const m = {
    'New': 'blue',
    'Contacted': 'amber',
    'Interested': 'green',
    'Not Interested': 'gray',
    'Closed': 'purple',
    'Available': 'green',
    'Under Negotiation': 'amber',
    'Sold': 'red',
    'Rented': 'red',
    'Leased': 'red',
    'Delisted': 'gray'
  };
  return <span className={`pill ${m[s] || 'gray'}`}><i></i>{s}</span>;
}

export default function CRM() {
  const { leads, updateLeadStatus, addLeadNote, mergeLeads } = useContext(AppDataContext);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Merge Leads State
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [primaryLeadId, setPrimaryLeadId] = useState('');
  const [duplicateLeadId, setDuplicateLeadId] = useState('');
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');

  const F = ['All', 'New', 'Contacted', 'Interested', 'Not Interested', 'Closed'];
  
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

  const handleStatusChange = async (newStatus) => {
    if (!selectedLead) return;
    try {
      await updateLeadStatus(selectedLead.id, newStatus);
      setSelectedLead(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update lead status: ' + err.message);
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
      alert('Failed to add note: ' + err.message);
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
      alert('Leads merged successfully! All activities, notes, and visits combined.');
    } catch (err) {
      setMergeError(err.message || 'Failed to merge leads.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="admin-theme">
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

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <div className="drawer-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-hd">
              <h3>Lead Details</h3>
              <button className="icon-btn" onClick={() => setSelectedLead(null)}>✕</button>
            </div>
            <div className="drawer-bd">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700 }}>
                  {selectedLead.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, marginBottom: 4 }}>{selectedLead.name}</h2>
                  <div style={{ color: 'var(--ink-2)', fontSize: 13.5 }}>
                    {selectedLead.phone} {selectedLead.email ? `· ${selectedLead.email}` : ''}
                  </div>
                  {selectedLead.loc && <div style={{ color: 'var(--ink-3)', fontSize: 12.5, marginTop: 2 }}>Location: {selectedLead.loc}</div>}
                </div>
              </div>

              <div className="fld">
                <label>Pipeline Status</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ maxWidth: 220, fontWeight: 600 }}
                >
                  {F.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                  Properties of Interest
                </h4>
                {selectedLead.props && selectedLead.props.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {selectedLead.props.map((p, i) => (
                      <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13.5, color: 'var(--blue)', fontWeight: 500 }}>
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>No specific properties attached to this lead.</p>
                )}
              </div>

              {/* Add Note / Activity Form */}
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                  Add Team Note
                </h4>
                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Log a call, visit notes, budget..."
                    style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                  />
                  <button type="submit" className="btn btn-blue btn-sm" disabled={addingNote || !newNote.trim()}>
                    {addingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </form>
              </div>

              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                  Activity & Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selectedLead.log && selectedLead.log.length > 0 ? (
                    selectedLead.log.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-soft)', display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0 }}>
                          {item.t.startsWith('Note:') ? '📝' : '🎯'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{item.t}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{item.w}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-soft)', display: 'grid', placeItems: 'center', fontSize: 12 }}>🎯</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>Lead Captured</div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>Via {selectedLead.src}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{selectedLead.first}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="drawer-ft" style={{ flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedLead(null)}>Close</button>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setPrimaryLeadId(selectedLead.id);
                    setDuplicateLeadId('');
                    setMergeError('');
                    setShowMergeModal(true);
                  }}
                >
                  Merge Lead...
                </button>
              </div>
              {selectedLead.phone && (() => {
                const cleanPhone = (selectedLead.phone || '').replace(/[^0-9]/g, '');
                const waNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const callNum = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
                return (
                  <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <a
                      href={`https://wa.me/${waNum}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ flex: 1, background: '#25D366', borderColor: '#25D366', textAlign: 'center', textDecoration: 'none' }}
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${callNum}`}
                      className="btn btn-blue"
                      style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                    >
                      Call
                    </a>
                  </div>
                );
              })()}
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
