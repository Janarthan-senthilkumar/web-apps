import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const routeInfo = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your document ecosystem' },
  '/documents': { title: 'All Documents', subtitle: 'Manage all registered documents' },
  '/my-documents': { title: 'My Documents', subtitle: 'Upload and track your documents' },
  '/pending': { title: 'Pending Review', subtitle: 'Approve or reject submitted documents' },
  '/verify': { title: 'Verify Document', subtitle: 'Authenticate documents using hash or ID' },
  '/blockchain': { title: 'Blockchain Ledger', subtitle: 'View the immutable chain of document records' },
  '/users': { title: 'User Management', subtitle: 'Manage registered accounts' },
};

const Topbar = ({ onAddDocument }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const info = routeInfo[location.pathname] || { title: 'BlockVerify', subtitle: '' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{info.title}</div>
        {info.subtitle && <div className="topbar-subtitle">{info.subtitle}</div>}
      </div>
      <div className="topbar-actions">
        {isAdmin && location.pathname === '/documents' && (
          <button className="btn btn-primary" onClick={onAddDocument}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Register Document
          </button>
        )}

        <div className="topbar-user">
          <div className={`topbar-avatar ${user?.role}`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="topbar-user-info">
            <div className="topbar-user-name">{user?.name}</div>
            <div className={`topbar-user-role ${user?.role}`}>{user?.role}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
