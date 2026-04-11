import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    HiOutlineViewGrid,
    HiOutlineCube,
    HiOutlineExclamationCircle,
    HiOutlineRefresh,
    HiOutlineChartBar,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineLogout,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, logout, isSupervisor } = useAuth();

    const navItems = [
        { label: 'Dashboard', path: '/', icon: <HiOutlineViewGrid /> },
        { label: 'Inventory', path: '/inventory', icon: <HiOutlineCube /> },
        { label: 'Damage Reports', path: '/damages', icon: <HiOutlineExclamationCircle /> },
        { label: 'Replacements', path: '/replacements', icon: <HiOutlineRefresh /> },
    ];

    // Add Analytics only for supervisor
    if (isSupervisor) {
        navItems.push({ label: 'Analytics', path: '/analytics', icon: <HiOutlineChartBar /> });
    }

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="app-layout">
            <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>

            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">📦</div>
                        <div className="sidebar-logo-text">
                            InvenTrack
                            <span>Damage & Replacement</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-label">Main Menu</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name || 'User'}</div>
                            <div className="sidebar-user-role">
                                {user?.role === 'supervisor' ? '👔 Supervisor' : '👷 Staff'}
                            </div>
                        </div>
                    </div>
                    <button className="sidebar-logout-btn" onClick={logout} title="Logout">
                        <HiOutlineLogout />
                    </button>
                </div>
            </aside>

            <main className="main-content fade-in">
                {children}
            </main>
        </div>
    );
}

export default Layout;
