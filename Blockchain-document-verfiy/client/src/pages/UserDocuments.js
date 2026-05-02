import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllDocuments, createDocument, updateDocument } from '../utils/api';
import DocumentForm from '../components/DocumentForm';
import DocumentDetail from '../components/DocumentDetail';

const getBadgeClass = (s) => ({ Active: 'badge-active', Revoked: 'badge-revoked', Expired: 'badge-expired', Pending: 'badge-pending' }[s] || 'badge-pending');
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const StatusIcon = ({ status }) => {
  if (status === 'Active') return <span style={{ color: 'var(--success)' }}>✓</span>;
  if (status === 'Pending') return <span style={{ color: 'var(--warning)' }}>⏳</span>;
  if (status === 'Revoked') return <span style={{ color: 'var(--danger)' }}>✕</span>;
  return <span style={{ color: 'var(--gray-400)' }}>—</span>;
};

const UserDocuments = () => {
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (filterStatus !== 'All') params.status = filterStatus;
      const res = await getAllDocuments(params);
      setDocs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (formData) => {
    try {
      await createDocument(formData);
      toast.success('Document submitted for verification!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit document');
      throw err;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateDocument(editDoc._id, formData);
      toast.success('Document updated');
      setEditDoc(null);
      setSelectedDoc(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
      throw err;
    }
  };

  const openEdit = (doc) => { setSelectedDoc(null); setEditDoc(doc); };

  return (
    <div className="page-content">
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {['All', 'Pending', 'Active', 'Revoked', 'Expired'].map((s) => (
            <button
              key={s}
              className={`page-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              style={{ padding: '6px 14px' }}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Upload Document
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : docs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h3>No documents yet</h3>
            <p>Upload your first document for verification</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 16 }}>
              Upload Document
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Document</th><th>Type</th><th>Issuer</th><th>Issue Date</th><th>Status</th><th>Review Note</th><th></th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.title}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-400)' }}>{doc.documentId}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{doc.documentType}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{doc.issuerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.issuerOrganization}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{fmt(doc.issueDate)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StatusIcon status={doc.status} />
                        <span className={`badge ${getBadgeClass(doc.status)}`}>{doc.status}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)', maxWidth: 180 }}>
                      {doc.verificationNote ? (
                        <span title={doc.verificationNote} style={{ cursor: 'help' }}>
                          {doc.verificationNote.length > 40 ? doc.verificationNote.slice(0, 40) + '...' : doc.verificationNote}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDoc(doc)} title="View">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {doc.status === 'Pending' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(doc)} title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        )}
      </div>

      <DocumentForm isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} editData={null} />
      <DocumentForm isOpen={!!editDoc} onClose={() => setEditDoc(null)} onSubmit={handleUpdate} editData={editDoc} />
      {selectedDoc && (
        <DocumentDetail
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onEdit={openEdit}
          onDelete={() => {}}
        />
      )}
    </div>
  );
};

export default UserDocuments;
