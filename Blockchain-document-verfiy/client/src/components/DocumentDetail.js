import React from 'react';
import { useAuth } from '../context/AuthContext';

const getBadgeClass = (status) => {
  const map = { Active: 'badge-active', Revoked: 'badge-revoked', Expired: 'badge-expired', Pending: 'badge-pending' };
  return map[status] || 'badge-pending';
};

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const DocumentDetail = ({ doc, onClose, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();
  if (!doc) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div className="card-title">{doc.title}</div>
              <span className={`badge ${getBadgeClass(doc.status)}`}>{doc.status}</span>
            </div>
            <div className="card-subtitle">{doc.documentType} · Block #{doc.blockIndex}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Document ID & Hash */}
          <div style={{ background: 'var(--primary-bg)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: 20, border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', marginBottom: 8 }}>🔗 Blockchain Record</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>DOCUMENT ID</span>
                <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', marginTop: 2 }}>{doc.documentId}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>VERIFICATION HASH (SHA-256)</span>
                <div className="hash-display">{doc.verificationHash}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>PREVIOUS HASH</span>
                <div className="hash-display">{doc.previousHash}</div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="doc-meta-grid" style={{ marginBottom: 20 }}>
            <div className="doc-meta-item">
              <label>Issuer Name</label>
              <span>{doc.issuerName}</span>
            </div>
            <div className="doc-meta-item">
              <label>Issuer Organization</label>
              <span>{doc.issuerOrganization}</span>
            </div>
            <div className="doc-meta-item">
              <label>Holder Name</label>
              <span>{doc.holderName}</span>
            </div>
            <div className="doc-meta-item">
              <label>Holder Email</label>
              <span>{doc.holderEmail}</span>
            </div>
            <div className="doc-meta-item">
              <label>Issue Date</label>
              <span>{fmt(doc.issueDate)}</span>
            </div>
            <div className="doc-meta-item">
              <label>Expiry Date</label>
              <span>{fmt(doc.expiryDate)}</span>
            </div>
            <div className="doc-meta-item">
              <label>Registered On</label>
              <span>{fmt(doc.createdAt)}</span>
            </div>
            <div className="doc-meta-item">
              <label>Verification Count</label>
              <span>{doc.verificationCount} times{doc.lastVerified ? ` · Last: ${fmt(doc.lastVerified)}` : ''}</span>
            </div>
          </div>

          {doc.description && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: 6 }}>Description</div>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>{doc.description}</p>
            </div>
          )}

          {doc.fileUrl && (
            <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: 10 }}>Attached Document</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: 'var(--primary-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.fileName}
                  </div>
                  {doc.fileSize > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                      {doc.fileSize < 1024 * 1024
                        ? (doc.fileSize / 1024).toFixed(1) + ' KB'
                        : (doc.fileSize / 1024 / 1024).toFixed(1) + ' MB'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {/\.(jpg|jpeg|png)$/i.test(doc.fileName) && (
                    <a
                      href={`http://localhost:5000${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                      Preview
                    </a>
                  )}
                  <a
                    href={`http://localhost:5000${doc.fileUrl}`}
                    download={doc.fileName}
                    className="btn btn-primary btn-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isAdmin && (
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(doc)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
              Delete
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          {(isAdmin || doc.status === 'Pending') && (
            <button className="btn btn-primary btn-sm" onClick={() => onEdit(doc)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
