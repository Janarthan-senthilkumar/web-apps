import React, { useState } from 'react';
import { verifyByHash, verifyById } from '../utils/api';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

const VerifyDocument = () => {
  const [tab, setTab] = useState('hash');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = tab === 'hash' ? await verifyByHash(input.trim()) : await verifyById(input.trim());
      setResult(res.data);
    } catch (err) {
      setResult({ success: false, verified: false, message: 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleVerify(); };

  return (
    <div className="page-content">
      <div className="verify-container">
        <div className="verify-card">
          <div className="verify-hero">
            <div className="verify-hero-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h2>Document Verification</h2>
            <p>Verify the authenticity of any registered document using its hash or ID</p>
          </div>

          <div className="verify-body">
            <div className="verify-tabs">
              <button className={`verify-tab ${tab === 'hash' ? 'active' : ''}`} onClick={() => { setTab('hash'); setInput(''); setResult(null); }}>
                🔐 Verify by Hash
              </button>
              <button className={`verify-tab ${tab === 'id' ? 'active' : ''}`} onClick={() => { setTab('id'); setInput(''); setResult(null); }}>
                🆔 Verify by ID
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">
                {tab === 'hash' ? 'Verification Hash (SHA-256)' : 'Document ID'}
              </label>
              <input
                className="form-input"
                style={{ fontFamily: tab === 'hash' ? 'monospace' : 'inherit', fontSize: tab === 'hash' ? 12 : 14 }}
                placeholder={tab === 'hash'
                  ? 'Paste the 64-character SHA-256 hash...'
                  : 'Enter document ID (e.g. DOC-ABC123...)'}
                value={input}
                onChange={e => { setInput(e.target.value); setResult(null); }}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              onClick={handleVerify}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Verifying on Blockchain...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Verify Document
                </>
              )}
            </button>

            {/* Result */}
            {result && (
              result.verified ? (
                <div className="result-success">
                  <div className="result-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Document Verified ✓
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--success)', marginBottom: 16, fontWeight: 500 }}>{result.message}</p>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {[
                      ['Title', result.data?.title],
                      ['Document Type', result.data?.documentType],
                      ['Document ID', result.data?.documentId],
                      ['Issued By', `${result.data?.issuerName} — ${result.data?.issuerOrganization}`],
                      ['Issued To', `${result.data?.holderName} (${result.data?.holderEmail})`],
                      ['Issue Date', fmt(result.data?.issueDate)],
                      ['Expiry Date', fmt(result.data?.expiryDate)],
                      ['Status', result.data?.status],
                      ['Block #', result.data?.blockIndex],
                      ['Verified', `${result.data?.verificationCount} times`],
                    ].map(([label, val]) => (
                      <div key={label} className="result-detail">
                        <strong style={{ color: 'var(--gray-600)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}:</strong>{' '}
                        <span style={{ color: 'var(--gray-800)', fontSize: 13 }}>{val || '—'}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Verification Hash</div>
                    <div className="hash-display">{result.data?.verificationHash}</div>
                  </div>
                </div>
              ) : (
                <div className="result-fail">
                  <div className="result-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    Verification Failed
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--danger)' }}>{result.message}</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8 }}>
                    This document could not be found in our blockchain registry. It may be unregistered, tampered, or the {tab === 'hash' ? 'hash' : 'ID'} may be incorrect.
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
          {[
            { icon: '🔐', title: 'Tamper-Proof', desc: 'SHA-256 hashes ensure documents cannot be altered without detection.' },
            { icon: '⛓️', title: 'Blockchain Linked', desc: 'Each document is chained to the previous for complete audit trail.' },
            { icon: '⚡', title: 'Instant Results', desc: 'Real-time verification against the distributed ledger.' },
            { icon: '🌐', title: 'Decentralized', desc: 'No single point of failure — records are permanently immutable.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerifyDocument;
