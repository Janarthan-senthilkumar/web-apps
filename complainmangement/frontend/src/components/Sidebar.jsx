import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, FileText, Users, UserCheck, LogOut,
    GraduationCap, Bell, Settings, ClipboardList
} from 'lucide-react';

const getNavItems = (role) => {
    if (role === 'admin') return [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/complaints', label: 'All Complaints', icon: FileText },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/staff', label: 'Staff', icon: UserCheck },
    ];
    if (role === 'staff') return [
        { to: '/staff', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/staff/complaints', label: 'Assigned Complaints', icon: ClipboardList },
    ];
    return [
        { to: '/user', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/user/submit', label: 'Submit Complaint', icon: FileText },
        { to: '/user/complaints', label: 'My Complaints', icon: ClipboardList },
    ];
};

const roleColors = {
    admin: { bg: '#fef3c7', text: '#92400e', label: 'Admin' },
    staff: { bg: '#dbeafe', text: '#1e40af', label: 'Staff' },
    user: { bg: '#d1fae5', text: '#065f46', label: 'Student' },
};

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const navItems = getNavItems(user?.role);
    const roleStyle = roleColors[user?.role] || roleColors.user;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <GraduationCap size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>CMS Portal</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Complaint Management</div>
                    </div>
                </div>
            </div>

            {/* User profile */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 600, fontSize: '0.85rem', flexShrink: 0
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name}
                        </div>
                        <span style={{
                            fontSize: '0.65rem', fontWeight: 600, padding: '1px 7px', borderRadius: '9999px',
                            background: roleStyle.bg, color: roleStyle.text
                        }}>
                            {roleStyle.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: '12px 0', flex: 1 }}>
                <div style={{ padding: '0 12px 6px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Navigation
                </div>
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to.split('/').length === 2}
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div style={{ padding: '12px 12px 20px', borderTop: '1px solid var(--border)' }}>
                <button className="sidebar-nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={handleLogout}>
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
