import React, { useState, useEffect } from 'react';
import { getAllDocuments } from '../utils/api';

const fmt = (d) => d ? new Date(d).toLocaleString() : '—';

const BlockCard = ({ doc, isFirst, isLast }) => (
  <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
    {/* Connector */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--accent-2))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 20, zIndex: 1, boxShadow: '0 0 0 4px var(--primary-bg)'
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
      </div>
      {!isLast && <div style={{ flex: 1, width: 2, background: 'var(--gray-200)', margin: '4px 0' }} />}
    </div>

    {/* Block */}
    <div style={{
      flex: 1,
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      marginBottom: 16,
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.2s'
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
    >
      {/* Block header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--primary)' }}>
              Block #{doc.blockIndex}
            </span>
            {isFirst && <span style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, border: '1px solid #bfdbfe' }}>GENESIS</span>}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginTop: 2 }}>{doc.title}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{fmt(doc.createdAt)}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 500 }}>{doc.documentType}</div>
        </div>
      </div>

      {/* Hashes */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: 3 }}>Current Hash</div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, background: 'var(--primary-bg)', padding: '6px 10px', borderRadius: 6, color: 'var(--primary-dark)', wordBreak: 'break-all', border: '1px solid #bfdbfe' }}>
            {doc.verificationHash}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)', marginBottom: 3 }}>Previous Hash</div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, background: 'var(--gray-50)', padding: '6px 10px', borderRadius: 6, color: 'var(--gray-500)', wordBreak: 'break-all', border: '1px solid var(--gray-200)' }}>
            {doc.previousHash}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          ['Holder', doc.holderName],
          ['Issuer', doc.issuerOrganization],
          ['ID', doc.documentId],
          ['Verifications', doc.verificationCount],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{l}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', fontFamily: l === 'ID' ? 'monospace' : 'inherit' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Blockchain = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllDocuments({ page, limit: 10 });
        // Sort by blockIndex ascending for ledger view
        const sorted = [...res.data.data].sort((a, b) => a.blockIndex - b.blockIndex);
        setDocs(sorted);
        setPagination(res.data.pagination);
      } catch {
        console.error('Failed to load blockchain');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div className="page-content">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header info */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Blocks', value: pagination.total, color: 'var(--primary)' },
              { label: 'Chain Integrity', value: '✓ Valid', color: 'var(--success)' },
              { label: 'Hash Algorithm', value: 'SHA-256', color: 'var(--accent-2)' },
              { label: 'Consensus', value: 'PoA', color: 'var(--warning)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 100 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : docs.length === 0 ? (
          <div className="empty-state card" style={{ padding: '60px 20px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <h3>Empty Blockchain</h3>
            <p>Register your first document to start the chain</p>
          </div>
        ) : (
          <div>
            {docs.map((doc, i) => (
              <BlockCard key={doc._id} doc={doc} isFirst={i === 0} isLast={i === docs.length - 1} />
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ fontSize: 13, color: 'var(--gray-500)', padding: '0 8px' }}>Page {page} of {pagination.pages}</span>
                <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blockchain;
