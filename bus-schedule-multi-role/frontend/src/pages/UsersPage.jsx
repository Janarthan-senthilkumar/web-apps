import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, Shield, Users, User, RefreshCw, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react'

const ROLES = ['staff', 'customer']
const EMPTY = { name: '', email: '', password: '', phone: '', department: '', role: 'staff', isActive: true }

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user ? { ...user, password: '' } : EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!user

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (isEdit && !payload.password) delete payload.password
      if (isEdit) {
        await userAPI.update(user._id, payload)
        toast.success('User updated!')
      } else {
        await userAPI.create(payload)
        toast.success('User created!')
      }
      onSave()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Priya Sundaram" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="priya@busnav.in" required />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input type="password" className="form-control" value={form.password} onChange={e => set('password', e.target.value)} placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'} minLength={isEdit ? undefined : 6} required={!isEdit} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Role <span className="required">*</span></label>
                <select className="form-control form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r === 'staff' ? 'Staff' : 'Customer'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-control" value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Operations" />
              </div>
            </div>
            {isEdit && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control form-select" value={form.isActive ? 'active' : 'inactive'} onChange={e => set('isActive', e.target.value === 'active')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ResetPasswordModal({ user, onClose }) {
  const [pwd, setPwd] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userAPI.resetPassword(user._id, pwd)
      toast.success('Password reset successfully!')
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">Reset Password</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
              Resetting password for <strong>{user.name}</strong> ({user.email})
            </p>
            <div className="form-group">
              <label className="form-label">New Password <span className="required">*</span></label>
              <input type="password" className="form-control" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Min 6 characters" minLength={6} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ROLE_COLORS = { organisation_head: { bg: '#7c3aed18', color: '#7c3aed', label: 'Org Head' }, staff: { bg: '#0891b218', color: '#0891b2', label: 'Staff' }, customer: { bg: '#05966918', color: '#059669', label: 'Customer' } }
const ROLE_ICONS = { organisation_head: Shield, staff: Users, customer: User }

export default function UsersPage() {
  const { isHead } = useAuth()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [modal, setModal] = useState(null) // null | { type: 'edit'|'create'|'reset', user? }
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterRole) params.role = filterRole
      const [usersRes, statsRes] = await Promise.all([userAPI.getAll(params), userAPI.getStats()])
      setUsers(usersRes.data)
      setStats(statsRes.data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, filterRole])

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return
    setDeleting(user._id)
    try {
      await userAPI.delete(user._id)
      toast.success('User deleted')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(null)
    }
  }

  if (!isHead) return (
    <div className="empty-state" style={{ padding: 60 }}>
      <div className="empty-state-icon">🔒</div>
      <h3>Access Restricted</h3>
      <p>Only Organisation Heads can manage users.</p>
    </div>
  )

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: 'blue' },
            { label: 'Staff Members', value: stats.staff, icon: Users, color: 'cyan' },
            { label: 'Customers', value: stats.customers, icon: User, color: 'green' },
            { label: 'Active Accounts', value: stats.active, icon: RefreshCw, color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div className="stat-card" key={label}>
              <div className="stat-info">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
              </div>
              <div className={`stat-icon ${color}`}><Icon size={22} /></div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">User Management</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ minWidth: 200 }}>
              <Search size={15} className="search-icon" />
              <input placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control form-select" style={{ width: 140, height: 38, fontSize: 13 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="organisation_head">Org Head</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'create' })}>
              <Plus size={15} /> Add User
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-overlay" style={{ position: 'relative', height: 200 }}>
              <div className="loading-spinner" />
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon">👥</div>
              <p>No users found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.customer
                  const Icon = ROLE_ICONS[u.role] || User
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: rc.bg, border: `1.5px solid ${rc.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={15} color={rc.color} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: rc.bg, color: rc.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {rc.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{u.phone || '—'}</td>
                      <td style={{ fontSize: 13 }}>{u.department || '—'}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                          {u.isActive ? <ToggleRight size={11} /> : <ToggleLeft size={11} />}
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Reset Password" onClick={() => setModal({ type: 'reset', user: u })}>
                            <KeyRound size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => setModal({ type: 'edit', user: u })}>
                            <Edit2 size={14} />
                          </button>
                          {u.role !== 'organisation_head' && (
                            <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={() => handleDelete(u)} disabled={deleting === u._id} style={{ color: 'var(--danger)' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal?.type === 'create' && (
        <UserModal onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
      {modal?.type === 'edit' && (
        <UserModal user={modal.user} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
      {modal?.type === 'reset' && (
        <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
