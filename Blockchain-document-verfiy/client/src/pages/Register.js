import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register as registerApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', organization: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data.token, res.data.user);
      toast.success(`Account created! Welcome, ${res.data.user.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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

        <div className="auth-role-info">
          <div className="role-card">
            <div className="role-icon admin-role">A</div>
            <div>
              <strong>Admin</strong>
              <p>Verify documents, manage users, full blockchain access</p>
            </div>
          </div>
          <div className="role-card">
            <div className="role-icon user-role">U</div>
            <div>
              <strong>User / Organization</strong>
              <p>Upload documents, track verification status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create Account</h2>
            <p>Join the blockchain document network</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" name="name" placeholder="Jane Smith" value={form.name} onChange={handleChange} autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Password <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Organization / Institution</label>
              <input className="form-input" name="organization" placeholder="MIT University, ABC Corp..." value={form.organization} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-toggle-btn ${form.role === 'user' ? 'active user' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, role: 'user' }))}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  User
                </button>
                <button
                  type="button"
                  className={`role-toggle-btn ${form.role === 'admin' ? 'active admin' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, role: 'admin' }))}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                  </svg>
                  Admin
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
