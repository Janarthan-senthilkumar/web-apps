import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllDocuments, reviewDocument } from '../utils/api';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const AdminPending = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [reviewModal, setReviewModal] = useState(null); // { doc, action }
  const [note, setNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllDocuments({ status: 'Pending', page, limit: 10 });
      setDocs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openReview = (doc, action) => {
    setReviewModal({ doc, action });
    setNote('');
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await reviewDocument(reviewModal.doc._id, reviewModal.action, note);
      toast.success(reviewModal.action === 'approve' ? 'Document approved and activated!' : 'Document rejected.');
      setReviewModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Pending Verification Queue</div>
            <div className="card-subtitle">{pagination.total} document{pagination.total !== 1 ? 's' : ''} awaiting review</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : docs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
            </svg>
            <h3>All clear!</h3>
            <p>No documents pending review</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Document</th><th>Type</th><th>Uploaded By</th><th>Holder</th><th>Issue Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.title}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-400)' }}>{doc.documentId}</div>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{doc.documentType}</span></td>
                    <td>
                      <div style={{ fontSize: 13 }}>{doc.uploadedByName || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.uploadedByEmail || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{doc.holderName}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.holderEmail}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{fmt(doc.issueDate)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={() => openReview(doc, 'approve')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => openReview(doc, 'reject')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Reject
                        </button>
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

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setReviewModal(null)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <div className="card-title" style={{ color: reviewModal.action === 'approve' ? 'var(--success)' : 'var(--danger)' }}>
                  {reviewModal.action === 'approve' ? '✓ Approve Document' : '✕ Reject Document'}
                </div>
                <div className="card-subtitle">{reviewModal.doc.title}</div>
              </div>
              <button className="modal-close" onClick={() => setReviewModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>Document Details</div>
                {[
                  ['Type', reviewModal.doc.documentType],
                  ['Holder', `${reviewModal.doc.holderName} (${reviewModal.doc.holderEmail})`],
                  ['Issuer', `${reviewModal.doc.issuerName} — ${reviewModal.doc.issuerOrganization}`],
                  ['Uploaded by', `${reviewModal.doc.uploadedByName || '—'}`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 4 }}>
                    <strong style={{ color: 'var(--gray-500)', minWidth: 90 }}>{l}:</strong>
                    <span style={{ color: 'var(--gray-800)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">
                  {reviewModal.action === 'approve' ? 'Approval Note (optional)' : 'Rejection Reason'}
                </label>
                <textarea
                  className="form-textarea"
                  placeholder={reviewModal.action === 'approve' ? 'Add any notes about this approval...' : 'Explain why this document is being rejected...'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ minHeight: 80 }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReviewModal(null)} disabled={reviewLoading}>Cancel</button>
              <button
                className={`btn ${reviewModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleReview}
                disabled={reviewLoading}
              >
                {reviewLoading ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Processing...</>
                ) : reviewModal.action === 'approve' ? 'Approve & Activate' : 'Reject Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPending;
