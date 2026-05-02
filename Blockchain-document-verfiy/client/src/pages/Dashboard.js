import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllDocuments } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const getBadgeClass = (s) => ({ Active: 'badge-active', Revoked: 'badge-revoked', Expired: 'badge-expired', Pending: 'badge-pending' }[s] || 'badge-pending');
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const StatCard = ({ label, value, color, icon }) => (
  <div className={`stat-card ${color}`}>
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getStats(), getAllDocuments({ limit: 5, page: 1 })])
      .then(([s, d]) => { setStats(s.data.data); setRecent(d.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="stats-grid">
        <StatCard label="Total Documents" value={stats?.total ?? 0} color="blue" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>} />
        <StatCard label="Active Documents" value={stats?.active ?? 0} color="green" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>} />
        <StatCard label="Pending Review" value={stats?.pending ?? 0} color="yellow" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <StatCard label="Revoked" value={stats?.revoked ?? 0} color="red" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>} />
        <StatCard label="Total Verifications" value={stats?.totalVerifications ?? 0} color="purple" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} />
      </div>

      {stats?.pending > 0 && (
        <div className="alert-banner" onClick={() => navigate('/pending')} role="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span><strong>{stats.pending}</strong> document{stats.pending !== 1 ? 's' : ''} pending your review</span>
          <span className="alert-banner-link">Review now →</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Documents</div>
              <div className="card-subtitle">Latest registered records</div>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
              <h3>No documents yet</h3>
              <p>Documents uploaded by users will appear here</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Title</th><th>Type</th><th>Holder</th><th>Status</th></tr></thead>
                <tbody>
                  {recent.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{doc.documentId}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{doc.documentType}</td>
                      <td>
                        <div style={{ fontSize: 13 }}>{doc.holderName}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.holderEmail}</div>
                      </td>
                      <td><span className={`badge ${getBadgeClass(doc.status)}`}>{doc.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Documents by Type</div></div>
          <div className="card-body">
            {!stats?.byType?.length ? (
              <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No data yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.byType.map(({ _id, count }) => (
                  <div key={_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>{_id}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{count}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (count / (stats?.total || 1)) * 100)}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 10, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--gray-100)', background: 'var(--gray-50)', borderRadius: '0 0 var(--radius) var(--radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>Blockchain network active</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

// ─── User Dashboard ───────────────────────────────────────────────────────────
const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([getStats(), getAllDocuments({ limit: 5, page: 1 })])
      .then(([s, d]) => { setStats(s.data.data); setRecent(d.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      {/* Welcome banner */}
      <div className="user-welcome-banner">
        <div>
          <h2>Welcome back, {user?.name}!</h2>
          <p>Upload documents and track their verification status on the blockchain.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/my-documents')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Upload Document
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Submitted" value={stats?.total ?? 0} color="blue" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>} />
        <StatCard label="Verified Active" value={stats?.active ?? 0} color="green" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>} />
        <StatCard label="Pending Review" value={stats?.pending ?? 0} color="yellow" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <StatCard label="Rejected" value={stats?.revoked ?? 0} color="red" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>} />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Submissions</div>
            <div className="card-subtitle">Your latest uploaded documents and their status</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/my-documents')}>View all</button>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            <h3>No documents submitted yet</h3>
            <p>Upload your first document to get started</p>
            <button className="btn btn-primary" onClick={() => navigate('/my-documents')} style={{ marginTop: 16 }}>
              Upload Document
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Document</th><th>Type</th><th>Issue Date</th><th>Status</th><th>Reviewed By</th></tr></thead>
              <tbody>
                {recent.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{doc.documentId}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{doc.documentType}</td>
                    <td style={{ fontSize: 13 }}>{fmt(doc.issueDate)}</td>
                    <td><span className={`badge ${getBadgeClass(doc.status)}`}>{doc.status}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{doc.verifiedBy || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Workflow info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 4 }}>
        {[
          { step: '1', icon: '📤', title: 'Upload Document', desc: 'Submit your document details. It enters the blockchain as Pending.' },
          { step: '2', icon: '🔍', title: 'Admin Review', desc: 'Our admin team verifies and validates the document authenticity.' },
          { step: '3', icon: '✅', title: 'Get Verified', desc: 'Approved documents become Active and receive a permanent hash.' },
        ].map(({ step, icon, title, desc }) => (
          <div key={step} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="workflow-step-num">{step}</div>
              <span style={{ fontSize: 20 }}>{icon}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, fontFamily: 'var(--font-display)' }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Root Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;
