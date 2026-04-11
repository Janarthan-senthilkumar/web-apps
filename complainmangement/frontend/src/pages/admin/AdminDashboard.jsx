import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { FileText, Clock, CheckCircle, AlertCircle, Users, UserCheck, TrendingUp } from 'lucide-react';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6b7280'];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, complaintsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/complaints?limit=5&page=1')
            ]);
            setStats(statsRes.data);
            setRecentComplaints(complaintsRes.data.complaints || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 20000);
        return () => clearInterval(interval);
    }, []);

    const statCards = stats ? [
        { label: 'Total Complaints', value: stats.total, icon: FileText, color: '#4f46e5', bg: '#eef2ff' },
        { label: 'Pending', value: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fefce8' },
        { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: '#10b981', bg: '#f0fdf4' },
        { label: 'Total Students', value: stats.totalUsers, icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
        { label: 'Staff Members', value: stats.totalStaff, icon: UserCheck, color: '#0891b2', bg: '#ecfeff' },
    ] : [];

    const pieData = stats ? [
        { name: 'Pending', value: stats.pending },
        { name: 'In Progress', value: stats.inProgress },
        { name: 'Resolved', value: stats.resolved },
        { name: 'Closed', value: stats.closed },
    ] : [];

    const statusBadge = (status) => {
        const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
        return <span className={`badge ${map[status] || ''}`}>{status}</span>;
    };

    if (loading) return (
        <Layout title="Admin Dashboard">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <div className="spinner" />
            </div>
        </Layout>
    );

    return (
        <Layout title="Admin Dashboard">
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className="stat-icon" style={{ background: bg }}>
                            <Icon size={22} color={color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 3 }}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Bar chart - by category */}
                <div className="card" style={{ padding: '20px 24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Complaints by Category</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats?.byCategory?.map(c => ({ name: c._id, count: c.count })) || []} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                            <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie chart - by status */}
                <div className="card" style={{ padding: '20px 24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: '#475569' }}>{v}</span>} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Complaints */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Recent Complaints</h3>
                    <a href="/admin/complaints" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>View all →</a>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Submitted By</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentComplaints.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No complaints yet</td></tr>
                            ) : recentComplaints.map(c => (
                                <tr key={c._id}>
                                    <td style={{ fontWeight: 500, maxWidth: 200 }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{c.title}</div>
                                    </td>
                                    <td><span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, color: 'var(--text-light)' }}>{c.category}</span></td>
                                    <td>
                                        <span className={`badge badge-${c.priority?.toLowerCase()}`}>{c.priority}</span>
                                    </td>
                                    <td>{statusBadge(c.status)}</td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{c.submittedBy?.name}</td>
                                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
