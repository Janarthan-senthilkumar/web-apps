import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await register(form);
            toast.success('Account created! Welcome.');
            navigate('/user');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ecfdf5 100%)', padding: 20
        }}>
            <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 24, padding: '44px 40px', boxShadow: '0 24px 80px rgba(79,70,229,0.15)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <GraduationCap size={26} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Register as a student to submit complaints</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Amit Verma', icon: User },
                        { name: 'email', label: 'College Email', type: 'email', placeholder: 'you@college.edu', icon: Mail },
                        { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters', icon: Lock },
                        { name: 'department', label: 'Department', type: 'text', placeholder: 'Computer Science', icon: Building },
                    ].map(({ name, label, type, placeholder, icon: Icon }) => (
                        <div key={name}>
                            <label className="label">{label}</label>
                            <div style={{ position: 'relative' }}>
                                <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" name={name} type={type} placeholder={placeholder} value={form[name]} onChange={handleChange} required={name !== 'department'} style={{ paddingLeft: 36 }} />
                            </div>
                        </div>
                    ))}
                    <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ marginTop: 4, justifyContent: 'center' }}>
                        {submitting ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 24 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
