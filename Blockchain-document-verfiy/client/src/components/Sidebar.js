import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllDocuments } from '../utils/api';

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  documents: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  verify: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
  chain: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  pending: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
};

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      getAllDocuments({ status: 'Pending', limit: 1 })
        .then((r) => setPendingCount(r.data.pagination?.total || 0))
        .catch(() => {});
    }
  }, [isAdmin]);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <div className="logo-text">BlockVerify</div>
          <div className="logo-sub">Secure · Verified</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.dashboard} Dashboard
        </NavLink>

        {isAdmin ? (
          <>
            <NavLink to="/documents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {icons.documents} All Documents
            </NavLink>
            <NavLink to="/pending" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {icons.pending}
              <span style={{ flex: 1 }}>Pending Review</span>
              {pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </NavLink>
          </>
        ) : (
          <NavLink to="/my-documents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icons.upload} My Documents
          </NavLink>
        )}

        <NavLink to="/verify" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.verify} Verify Document
        </NavLink>

        {isAdmin && (
          <>
            <div className="nav-section-label" style={{ marginTop: 16 }}>Administration</div>
            <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {icons.users} Users
            </NavLink>
            <NavLink to="/blockchain" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {icons.chain} Blockchain Ledger
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={`role-dot ${user?.role}`} />
          <div>
            <div className="sidebar-footer-text" style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
              {user?.name}
            </div>
            <div className="sidebar-footer-version" style={{ textTransform: 'capitalize' }}>
              {user?.role} · {user?.organization || 'BlockVerify'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
