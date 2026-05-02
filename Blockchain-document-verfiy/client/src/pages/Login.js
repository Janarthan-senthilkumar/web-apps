import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login as loginApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DEMO = {
  admin: { email: 'admin@blockverify.com', password: 'admin123' },
  user:  { email: 'user@blockverify.com',  password: 'user123'  },
};

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fillDemo = (role) => {
    setForm(DEMO[role]);
    setActiveDemo(role);
  };

  const handleChange = (e) => {
    setActiveDemo(null);
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="auth-brand-name">BlockVerify</div>
        <p className="auth-brand-tagline">Blockchain-Based Secure Document Verification</p>

        <div className="auth-features">
          {[
            { icon: '🔐', text: 'SHA-256 tamper-proof hashing' },
            { icon: '⛓️', text: 'Immutable blockchain ledger' },
            { icon: '✅', text: 'Admin-verified documents' },
            { icon: '📊', text: 'Real-time status tracking' },
          ].map(({ icon, text }) => (
            <div key={text} className="auth-feature-item">
              <span>{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Sign In</h2>
            <p>Access your document management portal</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>Quick Fill</span></div>
          <div className="auth-demo-hints">
            <div
              className={`auth-demo-item admin ${activeDemo === 'admin' ? 'selected' : ''}`}
              onClick={() => fillDemo('admin')}
              role="button"
              style={{ cursor: 'pointer' }}
            >
              <strong>Admin</strong>
              <span>{DEMO.admin.email}</span>
            </div>
            <div
              className={`auth-demo-item user ${activeDemo === 'user' ? 'selected' : ''}`}
              onClick={() => fillDemo('user')}
              role="button"
              style={{ cursor: 'pointer' }}
            >
              <strong>User</strong>
              <span>{DEMO.user.email}</span>
            </div>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
