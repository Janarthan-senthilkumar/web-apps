import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Bus, Eye, EyeOff, LogIn, UserPlus, Shield, Users, User } from 'lucide-react'

const DEMO_CREDS = [
  { role: 'Organisation Head', email: 'head@busnav.in', password: 'head@123', icon: Shield, color: '#7c3aed', bg: '#7c3aed18', desc: 'Full system access & user management' },
  { role: 'Staff', email: 'priya@busnav.in', password: 'staff@123', icon: Users, color: '#0891b2', bg: '#0891b218', desc: 'Schedule updates & operations' },
  { role: 'Customer', email: 'senthil@gmail.com', password: 'cust@123', icon: User, color: '#059669', bg: '#05966918', desc: 'Search & view schedules' },
]

export default function LoginPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register({ name: form.name, email: form.email, password: form.password, phone: form.phone })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (cred) => {
    setForm(f => ({ ...f, email: cred.email, password: cred.password }))
    setMode('login')
    setError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Background pattern */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 300 + i * 100,
            height: 300 + i * 100,
            borderRadius: '50%',
            border: '1px solid rgba(99,102,241,0.1)',
            top: `${10 + i * 12}%`,
            left: `${-10 + i * 15}%`,
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, position: 'relative' }}>

        {/* LEFT: Branding + Demo Creds */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Brand */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                🚌
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>BusNav</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Schedule Management System</div>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, maxWidth: 340 }}>
              Intelligent 3-level bus operations platform — from organisation heads to passengers.
            </p>
          </div>

          {/* Demo Credentials */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Quick Demo Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEMO_CREDS.map((cred) => {
                const Icon = cred.icon
                return (
                  <button
                    key={cred.role}
                    onClick={() => fillDemo(cred)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .2s',
                      width: '100%',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = cred.bg
                      e.currentTarget.style.borderColor = cred.color + '40'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: cred.bg, border: `1px solid ${cred.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={cred.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{cred.role}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{cred.desc}</div>
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>
                      Click to fill
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Login Form */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '36px 32px',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: mode === m ? 'rgba(99,102,241,0.8)' : 'transparent',
                color: mode === m ? '#fff' : '#64748b',
                transition: 'all .2s',
              }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              {mode === 'login' ? 'Sign in to your BusNav account' : 'Join as a customer to search bus schedules'}
            </p>
          </div>

          {error && (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.04em' }}>Full Name *</label>
                  <input
                    value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Ramesh Kumar" required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.04em' }}>Phone</label>
                  <input
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="9876543210" type="tel"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.04em' }}>Email Address *</label>
              <input
                type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.04em' }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2,
                }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: '13px 0',
                background: loading ? '#3730a3' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity .2s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Loading...</span>
              ) : mode === 'login' ? (
                <><LogIn size={16} /> Sign In</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 20 }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9,
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color .2s',
}
