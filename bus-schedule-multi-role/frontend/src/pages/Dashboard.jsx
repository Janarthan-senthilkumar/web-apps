import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { busAPI, routeAPI, scheduleAPI, userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Bus, Map, Calendar, Search, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle, Users, Shield, User } from 'lucide-react'

export default function Dashboard() {
  const { isHead, isStaff, isCustomer, user } = useAuth()
  const [busStats, setBusStats] = useState(null)
  const [schedStats, setSchedStats] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [recentSchedules, setRecentSchedules] = useState([])
  const [routeCount, setRouteCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const promises = [
          scheduleAPI.getAll({ status: 'On Time' }),
          routeAPI.getAll({ status: 'Active' }),
        ]
        if (!isCustomer) {
          promises.push(busAPI.getStats())
          promises.push(scheduleAPI.getStats())
        }
        if (isHead) {
          promises.push(userAPI.getStats())
        }
        const results = await Promise.all(promises)
        setRecentSchedules(results[0].data.slice(0, 6))
        setRouteCount(results[1].count)
        if (!isCustomer) { setBusStats(results[2].data); setSchedStats(results[3].data) }
        if (isHead) { setUserStats(results[4].data) }
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" />Loading dashboard...</div>

  const ROLE_WELCOME = {
    organisation_head: { emoji: '🏢', title: 'Organisation Head Dashboard', desc: 'Full control over buses, routes, schedules and staff management.', color: '#7c3aed' },
    staff: { emoji: '👷', title: 'Staff Operations Dashboard', desc: 'Monitor schedules, update statuses and manage day-to-day operations.', color: '#0891b2' },
    customer: { emoji: '🧳', title: `Welcome, ${user?.name?.split(' ')[0]}!`, desc: 'Search for bus schedules and plan your journey across Tamil Nadu.', color: '#059669' },
  }
  const wm = ROLE_WELCOME[user?.role] || ROLE_WELCOME.customer

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${wm.color}dd 0%, ${wm.color}99 100%)`,
        borderRadius: 'var(--radius)', padding: '28px 32px', color: '#fff',
        marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{wm.emoji} {wm.title}</h1>
          <p style={{ opacity: .88, fontSize: 14, maxWidth: 500 }}>{wm.desc}</p>
        </div>
        <Link to="/search" className="btn btn-lg" style={{ background: '#fff', color: wm.color, fontWeight: 700 }}>
          <Search size={18} /> Search Travel
        </Link>
      </div>

      {/* Stats — only for staff/head */}
      {!isCustomer && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info"><span className="stat-label">Total Buses</span><span className="stat-value">{busStats?.total ?? 0}</span><span className="stat-sub">{busStats?.active} active</span></div>
            <div className="stat-icon blue"><Bus size={24} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info"><span className="stat-label">Active Routes</span><span className="stat-value">{routeCount}</span><span className="stat-sub">Across all regions</span></div>
            <div className="stat-icon green"><Map size={24} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info"><span className="stat-label">Total Schedules</span><span className="stat-value">{schedStats?.total ?? 0}</span><span className="stat-sub">{schedStats?.todayCount} running today</span></div>
            <div className="stat-icon amber"><Calendar size={24} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info"><span className="stat-label">On Time</span><span className="stat-value">{schedStats?.onTime ?? 0}</span><span className="stat-sub" style={{ color: 'var(--success)' }}>▲ On schedule</span></div>
            <div className="stat-icon cyan"><TrendingUp size={24} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info"><span className="stat-label">Delayed</span><span className="stat-value" style={{ color: 'var(--warning)' }}>{schedStats?.delayed ?? 0}</span><span className="stat-sub">Needs attention</span></div>
            <div className="stat-icon amber"><Clock size={24} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info"><span className="stat-label">In Maintenance</span><span className="stat-value" style={{ color: 'var(--danger)' }}>{busStats?.maintenance ?? 0}</span><span className="stat-sub">Under service</span></div>
            <div className="stat-icon red"><AlertCircle size={24} /></div>
          </div>
        </div>
      )}

      {/* Head: user stats */}
      {isHead && userStats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Users', value: userStats.total, color: 'blue', Icon: Users },
            { label: 'Staff Members', value: userStats.staff, color: 'cyan', Icon: Shield },
            { label: 'Customers', value: userStats.customers, color: 'green', Icon: User },
            { label: 'Active Accounts', value: userStats.active, color: 'amber', Icon: TrendingUp },
          ].map(({ label, value, color, Icon }) => (
            <div className="stat-card" key={label}>
              <div className="stat-info"><span className="stat-label">{label}</span><span className="stat-value">{value}</span></div>
              <div className={`stat-icon ${color}`}><Icon size={22} /></div>
            </div>
          ))}
        </div>
      )}

      {/* Customer: simple quick actions */}
      {isCustomer ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/search', icon: <Search size={16} />, label: 'Search Bus Travel', color: '#2563eb' },
                { to: '/routes', icon: <Map size={16} />, label: 'Browse Routes', color: '#059669' },
                { to: '/schedules', icon: <Calendar size={16} />, label: 'View Schedules', color: '#d97706' },
                { to: '/buses', icon: <Bus size={16} />, label: 'Bus Directory', color: '#0891b2' },
              ].map(({ to, icon, label, color }) => (
                <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, textDecoration: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)', transition: 'all .2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = color}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span style={{ color, background: `${color}15`, padding: 8, borderRadius: 8 }}>{icon}</span>{label}
                </Link>
              ))}
            </div>
          </div>
          <ScheduleTable schedules={recentSchedules} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/search', icon: <Search size={16} />, label: 'Search Travel', color: '#2563eb' },
                { to: '/buses', icon: <Bus size={16} />, label: 'Manage Buses', color: '#0891b2' },
                { to: '/routes', icon: <Map size={16} />, label: 'Manage Routes', color: '#059669' },
                { to: '/schedules', icon: <Calendar size={16} />, label: 'Manage Schedules', color: '#d97706' },
                ...(isHead ? [{ to: '/users', icon: <Users size={16} />, label: 'Manage Users', color: '#7c3aed' }] : []),
              ].map(({ to, icon, label, color }) => (
                <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, textDecoration: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)', transition: 'all .2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = color}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span style={{ color, background: `${color}15`, padding: 8, borderRadius: 8 }}>{icon}</span>{label}
                </Link>
              ))}
            </div>
          </div>
          <ScheduleTable schedules={recentSchedules} />
        </div>
      )}
    </div>
  )
}

function ScheduleTable({ schedules }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Today's Running Schedules</span>
        <Link to="/schedules" className="btn btn-outline btn-sm">View All</Link>
      </div>
      <div className="table-wrapper">
        {schedules.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}><div className="empty-state-icon">📅</div><p>No schedules running today</p></div>
        ) : (
          <table>
            <thead><tr><th>Bus</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Status</th></tr></thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s._id}>
                  <td><div style={{ fontWeight: 700, fontSize: 13 }}>{s.bus?.busNumber}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.bus?.type}</div></td>
                  <td><div style={{ fontSize: 13, fontWeight: 600 }}>{s.route?.source} → {s.route?.destination}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Route {s.route?.routeNumber}</div></td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.departureTime}</td>
                  <td style={{ fontWeight: 600 }}>{s.arrivalTime}</td>
                  <td>
                    <span className={`badge ${s.status === 'On Time' ? 'badge-green' : s.status === 'Delayed' ? 'badge-amber' : 'badge-red'}`}>
                      {s.status === 'On Time' && <CheckCircle size={11} />}
                      {s.status === 'Delayed' && <Clock size={11} />}
                      {s.status === 'Cancelled' && <XCircle size={11} />}
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
