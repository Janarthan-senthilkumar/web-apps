import React from 'react';

const ConfirmDelete = ({ doc, onConfirm, onCancel, loading }) => {
  if (!doc) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div>
            <div className="card-title" style={{ color: 'var(--danger)' }}>Delete Document</div>
            <div className="card-subtitle">This action cannot be undone</div>
          </div>
          <button className="modal-close" onClick={onCancel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--danger-bg)', border: '1px solid #fecaca', borderRadius: 'var(--radius)', padding: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete <strong>"{doc.title}"</strong>? 
              This record will be removed from the system.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={() => onConfirm(doc._id)} disabled={loading}>
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
