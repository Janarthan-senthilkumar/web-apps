import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Bus, Map, Calendar, Search, LayoutDashboard, Menu, X, Clock,
  Shield, Users, User, LogOut, ChevronDown, Settings
} from 'lucide-react'
import { Toaster } from 'react-hot-toast'

import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import SearchPage from './pages/SearchPage'
import BusesPage from './pages/BusesPage'
import RoutesPage from './pages/RoutesPage'
import SchedulesPage from './pages/SchedulesPage'
import UsersPage from './pages/UsersPage'
import ProfilePage from './pages/ProfilePage'

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  return (
    <span className="topbar-time">
      <Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
    </span>
  )
}

const ROLE_META = {
  organisation_head: { label: 'Org Head', color: '#7c3aed', bg: '#7c3aed18', Icon: Shield },
  staff: { label: 'Staff', color: '#0891b2', bg: '#0891b218', Icon: Users },
  customer: { label: 'Customer', color: '#059669', bg: '#05966918', Icon: User },
}

function Shell() {
  const { user, logout, isHead, isCustomer } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()

  const meta = ROLE_META[user?.role] || ROLE_META.customer

  const NAV_SECTIONS = [
    {
      label: 'Main',
      links: [
        { label: 'Dashboard', to: '/', icon: LayoutDashboard, exact: true, roles: ['all'] },
        { label: 'Search Travel', to: '/search', icon: Search, roles: ['all'] },
      ]
    },
    {
      label: isCustomer ? 'Browse' : 'Management',
      links: [
        { label: 'Buses', to: '/buses', icon: Bus, roles: ['all'] },
        { label: 'Routes', to: '/routes', icon: Map, roles: ['all'] },
        { label: 'Schedules', to: '/schedules', icon: Calendar, roles: ['all'] },
      ]
    },
    ...(!isCustomer ? [{
      label: 'Administration',
      links: [
        ...( isHead ? [{ label: 'User Management', to: '/users', icon: Users, roles: ['organisation_head'] }] : []),
      ]
    }] : []),
  ].filter(s => s.links.length > 0)

  const PAGE_TITLES = {
    '/': 'Dashboard', '/search': 'Search Travel', '/buses': 'Bus Management',
    '/routes': 'Route Management', '/schedules': 'Schedule Management',
    '/users': 'User Management', '/profile': 'My Profile',
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon">🚌</div>
            <div className="brand-text">
              <span className="brand-name">BusNav</span>
              <span className="brand-sub">Schedule System</span>
            </div>
          </div>
        </div>

        {/* Role badge in sidebar */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ background: meta.bg, border: `1px solid ${meta.color}25`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <meta.Icon size={15} color={meta.color} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_SECTIONS.map(section => (
            <div className="nav-section" key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.links.map(({ label, to, icon: Icon, exact }) => (
                <NavLink key={to} to={to} end={exact}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}>
                  <Icon size={18} />{label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">© 2024 BusNav · All rights reserved</div>
      </aside>

      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-icon" id="menu-btn" style={{ display: 'none' }}
              onClick={() => setSidebarOpen(o => !o)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <div className="topbar-title">{PAGE_TITLES[location.pathname] || 'BusNav'}</div>
              <div className="topbar-breadcrumb">Intelligent Bus Schedule Navigation</div>
            </div>
          </div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LiveClock />
            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '7px 12px', cursor: 'pointer', color: 'var(--text)',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: meta.bg, border: `1.5px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <meta.Icon size={13} color={meta.color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</span>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>
              {userMenuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setUserMenuOpen(false)} />
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                      <span style={{ marginTop: 6, display: 'inline-block', background: meta.bg, color: meta.color, padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>{meta.label}</span>
                    </div>
                    <NavLink to="/profile" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', textDecoration: 'none', color: 'var(--text)', fontSize: 13 }}>
                      <Settings size={14} /> My Profile
                    </NavLink>
                    <button onClick={() => { setUserMenuOpen(false); logout() }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', border: 'none', background: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/buses" element={<BusesPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function AppGate() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading BusNav...</p>
      </div>
    </div>
  )

  if (!user) return <LoginPage />

  return <Shell />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppGate />
      </AuthProvider>
    </BrowserRouter>
  )
}
