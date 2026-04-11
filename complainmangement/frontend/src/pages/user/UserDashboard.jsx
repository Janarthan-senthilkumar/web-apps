import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FileText, Clock, CheckCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/my');
            setComplaints(res.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchComplaints();
        const interval = setInterval(fetchComplaints, 15000);
        return () => clearInterval(interval);
    }, []);

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    const statusBadge = (status) => {
        const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
        return <span className={`badge ${map[status] || ''}`}>{status}</span>;
    };

    return (
        <Layout title="My Dashboard">
            {/* Welcome banner */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                borderRadius: 16, padding: '24px 28px', marginBottom: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: 'white'
            }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>Welcome, {user?.name?.split(' ')[0]}! 👋</div>
                    <div style={{ opacity: 0.85, fontSize: '0.88rem' }}>Track your complaints and get real-time updates from our team</div>
                </div>
                <Link to="/user/submit" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.35)', fontWeight: 600 }}>
                    <Send size={16} /> Submit Complaint
                </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Filed', value: total, icon: FileText, color: '#4f46e5', bg: '#eef2ff' },
                    { label: 'Pending', value: pending, icon: Clock, color: '#f59e0b', bg: '#fefce8' },
                    { label: 'In Progress', value: inProgress, icon: Clock, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Resolved', value: resolved, icon: CheckCircle, color: '#10b981', bg: '#f0fdf4' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className="stat-icon" style={{ background: bg }}><Icon size={20} color={color} /></div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 3 }}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent complaints */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Recent Complaints</h3>
                    <Link to="/user/complaints" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
                </div>
                {loading ? (
                    <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
                ) : complaints.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={32} />
                        <h3>No complaints yet</h3>
                        <p>Submit your first complaint to get started</p>
                        <Link to="/user/submit" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-flex' }}>Submit Complaint</Link>
                    </div>
                ) : complaints.slice(0, 5).map(c => (
                    <div key={c._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {c.category} · {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {c.assignedTo && <span> · <strong style={{ color: 'var(--text-light)' }}>Assigned to: {c.assignedTo.name}</strong></span>}
                            </div>
                        </div>
                        {statusBadge(c.status)}
                    </div>
                ))}
            </div>
        </Layout>
    );
}
