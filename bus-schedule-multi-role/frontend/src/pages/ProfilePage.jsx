import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Shield, Users, KeyRound, Save } from 'lucide-react'

const ROLE_META = {
  organisation_head: { label: 'Organisation Head', color: '#7c3aed', bg: '#7c3aed18', icon: Shield, desc: 'Full system access — buses, routes, schedules, users' },
  staff: { label: 'Staff', color: '#0891b2', bg: '#0891b218', icon: Users, desc: 'Can view all data and update schedule statuses' },
  customer: { label: 'Customer', color: '#059669', bg: '#05966918', icon: User, desc: 'Can search and view bus schedules' },
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const meta = ROLE_META[user?.role] || ROLE_META.customer
  const Icon = meta.icon

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePwdSave = async (e) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setSavingPwd(true)
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword })
      toast.success('Password changed successfully!')
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Profile Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}08)`,
        border: `1px solid ${meta.color}25`,
        borderRadius: 'var(--radius)',
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: meta.bg, border: `2px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={30} color={meta.color} />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: meta.bg, color: meta.color, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{meta.desc}</p>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Edit Profile</span>
        </div>
        <form onSubmit={handleProfileSave}>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label"><User size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Full Name</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label"><Phone size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><Mail size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Email Address</label>
              <input className="form-control" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Email cannot be changed</small>
            </div>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              <Save size={14} /> {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><KeyRound size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Change Password</span>
        </div>
        <form onSubmit={handlePwdSave}>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Current Password <span className="required">*</span></label>
              <input type="password" className="form-control" value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">New Password <span className="required">*</span></label>
                <input type="password" className="form-control" value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))} minLength={6} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password <span className="required">*</span></label>
                <input type="password" className="form-control" value={pwdForm.confirmPassword} onChange={e => setPwdForm(f => ({ ...f, confirmPassword: e.target.value }))} minLength={6} required />
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingPwd}>
              <KeyRound size={14} /> {savingPwd ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
