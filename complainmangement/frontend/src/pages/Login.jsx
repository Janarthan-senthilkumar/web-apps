import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
    { label: 'Admin', email: 'admin@college.edu', password: 'Admin@123', color: '#7c3aed' },
    { label: 'Staff 1', email: 'staff1@college.edu', password: 'Staff@123', color: '#1d4ed8' },
    { label: 'User 1', email: 'user1@college.edu', password: 'User@123', color: '#065f46' },
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'staff') navigate('/staff');
            else navigate('/user');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const fillDemo = (acc) => { setEmail(acc.email); setPassword(acc.password); };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ecfdf5 100%)',
            padding: 20, position: 'relative', overflow: 'hidden'
        }}>
            {/* Background decorations */}
            <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(79,70,229,0.08)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(124,58,237,0.06)' }} />

            <div style={{ width: '100%', maxWidth: 860, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 80px rgba(79,70,229,0.15)' }}>
                {/* Left panel */}
                <div style={{
                    background: 'linear-gradient(160deg, #4f46e5, #7c3aed)',
                    padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={24} color="white" />
                            </div>
                            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>CMS Portal<br /><span style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.8 }}>Complaint Management System</span></div>
                        </div>
                        <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>
                            Manage & Resolve<br />Complaints Efficiently
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                            A unified platform for students, staff, and administrators to track and resolve academic complaints in real time.
                        </p>
                    </div>

                    <div>
                        <div style={{ marginBottom: 12, color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', fontWeight: 600 }}>QUICK DEMO LOGIN</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {DEMO_ACCOUNTS.map(acc => (
                                <button key={acc.label} onClick={() => fillDemo(acc)} style={{
                                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                                    borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                >
                                    <span style={{ color: 'white', fontWeight: 500, fontSize: '0.82rem' }}>
                                        👤 {acc.label} — {acc.email}
                                    </span>
                                    <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right panel - login form */}
                <div style={{ background: 'white', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Welcome back</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 32 }}>Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label className="label">Email address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: 36 }} />
                            </div>
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: 36, paddingRight: 40 }} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ marginTop: 4, justifyContent: 'center' }}>
                            {submitting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 24 }}>
                        New student?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
