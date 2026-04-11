import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineExclamationCircle } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <div className="login-logo-icon">📦</div>
                            <h1 className="login-title">InvenTrack</h1>
                            <p className="login-subtitle">Damage & Replacement Tracking System</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <h2 className="login-form-title">Sign In</h2>
                        <p className="login-form-desc">Enter your credentials to access the system</p>

                        {error && (
                            <div className="login-error">
                                <HiOutlineExclamationCircle />
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email Address</label>
                            <div className="login-input-wrapper">
                                <HiOutlineMail className="login-input-icon" />
                                <input
                                    id="login-email"
                                    type="email"
                                    className="form-input login-input"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <div className="login-input-wrapper">
                                <HiOutlineLockClosed className="login-input-icon" />
                                <input
                                    id="login-password"
                                    type="password"
                                    className="form-input login-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="login-demo-creds">
                            <p className="login-demo-title">Demo Credentials</p>
                            <div className="login-demo-grid">
                                <button type="button" className="login-demo-card" onClick={() => { setEmail('staff@demo.com'); setPassword('staff123'); }}>
                                    <span className="login-demo-role">👷 Staff</span>
                                    <span className="login-demo-email">staff@demo.com</span>
                                </button>
                                <button type="button" className="login-demo-card" onClick={() => { setEmail('supervisor@demo.com'); setPassword('super123'); }}>
                                    <span className="login-demo-role">👔 Supervisor</span>
                                    <span className="login-demo-email">supervisor@demo.com</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
