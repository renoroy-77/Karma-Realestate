import { useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AppDataContext } from '../../context/AppDataContext';
import api from '../../lib/api';

export default function Documents() {
  const {
    props,
    docs,
    remarks,
    fetchPropertyDocuments,
    uploadDocument,
    deleteDocument,
    saveRemark
  } = useContext(AppDataContext);
  
  const [activePropId, setActivePropId] = useState(props[0]?.id);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    doc_type: 'title_deed',
    file: null,
    apply_watermark: true
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [remarkSaved, setRemarkSaved] = useState(false);
  const [currentRemark, setCurrentRemark] = useState('');
  const [selectedDocForLogs, setSelectedDocForLogs] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [docLogs, setDocLogs] = useState([]);
  const fileInputRef = useRef(null);

  // Set initial active prop
  useEffect(() => {
    if (!activePropId && props.length > 0) {
      setActivePropId(props[0].id);
    }
  }, [props, activePropId]);

  // Load documents and remarks whenever active property changes
  useEffect(() => {
    if (activePropId) {
      fetchPropertyDocuments(activePropId);
      setCurrentRemark(remarks[activePropId] || '');
    }
  }, [activePropId]);

  // Keep currentRemark in sync if remarks object changes from backend
  useEffect(() => {
    if (activePropId && remarks[activePropId] !== undefined) {
      setCurrentRemark(remarks[activePropId] || '');
    }
  }, [remarks, activePropId]);

  const p = props.find(x => x.id === activePropId) || props[0];
  const pDocs = (p ? docs[p.id] : []) || [];

  const handleRemarkChange = (val) => {
    setCurrentRemark(val);
    setRemarkSaved(false);
  };

  const handleSaveRemark = async () => {
    if (!p) return;
    try {
      await saveRemark(p.id, currentRemark);
      setRemarkSaved(true);
      toast.success('Internal remark saved');
      setTimeout(() => setRemarkSaved(false), 3000);
    } catch (err) {
      toast.error('Failed to save remark: ' + (err.message || 'Error'));
    }
  };

  const handleOpenUpload = () => {
    setUploadData({
      title: '',
      doc_type: 'title_deed',
      file: null,
      apply_watermark: true
    });
    setUploadError('');
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.file) {
      setUploadError('Please provide a document title and choose a file.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      await uploadDocument(p.id, uploadData);
      setShowUploadModal(false);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = (docId, title) => {
    toast(`Delete "${title}"?`, {
      description: 'This document will be permanently removed from the secure vault.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteDocument(docId, p.id);
            toast.success(`"${title}" deleted`);
          } catch (err) {
            toast.error('Failed to delete document: ' + (err.message || 'Error'));
          }
        }
      },
      cancel: { label: 'Cancel' },
      duration: 6000
    });
  };

  const handleViewDoc = async (docId) => {
    try {
      const res = await api.get(`/admin/documents/${docId}/view`, { responseType: 'blob' });
      const fileUrl = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
      window.open(fileUrl, '_blank');
    } catch (err) {
      toast.error('Could not preview document: ' + (err.message || 'Error'));
    }
  };

  const handleDownloadDoc = async (docId, fileName) => {
    try {
      const res = await api.get(`/admin/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `document-${docId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Could not download document: ' + (err.message || 'Error'));
    }
  };

  const handleViewLogs = async (d) => {
    setSelectedDocForLogs(d);
    setLogsLoading(true);
    setDocLogs([]);
    try {
      const res = await api.get(`/admin/documents/${d.id}/logs`);
      if (res.data.success) {
        setDocLogs(res.data.data);
      }
    } catch (err) {
      toast.error('Could not load audit logs: ' + (err.message || 'Error'));
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="admin-theme">
      {/* Property Selector Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {props.map(x => (
          <button 
            key={x.id}
            className={`fchip ${x.id === p?.id ? 'on' : ''}`} 
            onClick={() => setActivePropId(x.id)}
          >
            {x.title.split(',')[0]}
            {docs[x.id]?.length ? ` (${docs[x.id].length})` : ''}
          </button>
        ))}
      </div>
      
      {p ? (
        <div className="panel">
          <div className="panel-hd">
            <div>
              <h3>{p.title} · Confidential Vault</h3>
              <p>Stored privately on server — never exposed in public HTML, APIs or search</p>
            </div>
            <button className="btn btn-blue btn-sm" onClick={handleOpenUpload}>+ Upload document</button>
          </div>
          
          {pDocs.length > 0 ? pDocs.map((d) => (
            <div key={d.id} className="doc-row">
              <div className={`doc-ic ${d.k === 'img' ? 'img' : ''}`}>
                {d.k === 'img' ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L5 22"/>
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/>
                  </svg>
                )}
              </div>
              <div className="doc-main">
                <b>{d.n}</b>
                <span>{d.s} · {d.type?.replace(/_/g, ' ')}</span>
              </div>
              {d.is_watermarked && (
                <span className="wm-tag">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg> 
                  Watermarked
                </span>
              )}
              <div className="row-actions">
                <button className="icon-btn" title="View Audit Logs" onClick={() => handleViewLogs(d)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                </button>
                <button className="icon-btn" title="View (Logged)" onClick={() => handleViewDoc(d.id)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button className="icon-btn" title="Download (Logged)" onClick={() => handleDownloadDoc(d.id, d.n)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
                </button>
                <button className="icon-btn" title="Delete document" style={{ color: 'var(--red)' }} onClick={() => handleDeleteDoc(d.id, d.n)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          )) : (
            <div className="empty">
              <b>No documents yet</b>
              Upload title deeds, EC, tax receipts, or floor plans — watermarking and audit logging are automatic.
            </div>
          )}
          
          <div className="remarks" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h5 style={{ margin: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg> 
                Internal remarks — admin only
              </h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {remarkSaved && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Saved ✓</span>}
                <button className="btn btn-outline btn-sm" onClick={handleSaveRemark}>
                  Save Remark
                </button>
              </div>
            </div>
            <textarea 
              rows="3"
              value={currentRemark}
              onChange={e => handleRemarkChange(e.target.value)}
              placeholder="e.g. Owner open to 5% negotiation, title verified by Adv. Rajan, EC clear up to 2026…"
            />
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="empty">
            <b>No properties available</b>
            Create a property first to manage its confidential vault.
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="overlay" onClick={(e) => e.target.className === 'overlay' && !uploading && setShowUploadModal(false)} style={{ zIndex: 100 }}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-hd">
              <b>Upload Confidential Document</b>
              <button className="modal-x" onClick={() => !uploading && setShowUploadModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-bd">
                {uploadError && (
                  <div style={{ background: 'var(--red-soft)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                    {uploadError}
                  </div>
                )}

                <div className="fld">
                  <label>Document Title *</label>
                  <input
                    required
                    value={uploadData.title}
                    onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="e.g. Title Deed Deed No 142/2018"
                  />
                </div>

                <div className="fld">
                  <label>Document Type *</label>
                  <select
                    value={uploadData.doc_type}
                    onChange={e => setUploadData({ ...uploadData, doc_type: e.target.value })}
                  >
                    <option value="title_deed">Title Deed</option>
                    <option value="encumbrance_certificate">Encumbrance Certificate (EC)</option>
                    <option value="tax_receipt">Land / Building Tax Receipt</option>
                    <option value="floor_plan">Approved Floor Plan</option>
                    <option value="possession_certificate">Possession Certificate</option>
                    <option value="other">Other Legal Document</option>
                  </select>
                </div>

                <div className="fld">
                  <label>Choose File * (PDF, PNG, JPG)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    required
                    accept=".pdf,image/*"
                    onChange={e => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                    style={{ padding: '8px 0' }}
                  />
                </div>

                <div className="fld">
                  <label className="check-line" style={{ padding: 0, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={uploadData.apply_watermark}
                      onChange={e => setUploadData({ ...uploadData, apply_watermark: e.target.checked })}
                    />
                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>Apply KARMA dynamic watermark to prevent unauthorized leaks</span>
                  </label>
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f9fafb' }}>
                <button type="button" className="btn btn-outline" disabled={uploading} onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {selectedDocForLogs && (
        <div className="overlay" onClick={() => setSelectedDocForLogs(null)} style={{ zIndex: 100 }}>
          <div className="modal" style={{ maxWidth: 650 }}>
            <div className="modal-hd">
              <b>Audit Trail · {selectedDocForLogs.n}</b>
              <button className="modal-x" onClick={() => setSelectedDocForLogs(null)}>✕</button>
            </div>
            <div className="modal-bd" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
                Immutable access log tracking every view, download, and modification for legal compliance.
              </p>

              {logsLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--ink-2)' }}>Loading audit records...</div>
              ) : docLogs.length > 0 ? (
                <table className="tbl" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>User</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docLogs.map((log) => {
                      const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      }) : 'N/A';
                      const actionColor = log.action === 'uploaded' ? 'blue' : log.action === 'downloaded' ? 'green' : log.action === 'deleted' ? 'red' : 'amber';
                      return (
                        <tr key={log.id}>
                          <td style={{ whiteSpace: 'nowrap', color: 'var(--ink-3)' }}>{dateStr}</td>
                          <td>
                            <span className={`pill ${actionColor}`}>{log.action}</span>
                          </td>
                          <td>
                            <b>{log.admin_name}</b>
                            {log.admin_email && <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>{log.admin_email}</span>}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.ip_address || '127.0.0.1'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty" style={{ padding: '24px' }}>
                  <b>No access events recorded yet</b>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', background: '#f9fafb' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedDocForLogs(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
