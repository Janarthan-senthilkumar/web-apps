import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { ClipboardList, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StaffDashboard() {
    const [stats, setStats] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, compRes] = await Promise.all([
                api.get('/staff/stats'),
                api.get('/staff/complaints')
            ]);
            setStats(statsRes.data);
            setRecentComplaints(compRes.data.slice(0, 5));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const statusBadge = (status) => {
        const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
        return <span className={`badge ${map[status] || ''}`}>{status}</span>;
    };

    if (loading) return <Layout title="My Dashboard"><div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div></Layout>;

    const chartData = [
        { name: 'Pending', count: stats?.pending || 0, fill: '#f59e0b' },
        { name: 'In Progress', count: stats?.inProgress || 0, fill: '#3b82f6' },
        { name: 'Resolved', count: stats?.resolved || 0, fill: '#10b981' },
    ];

    return (
        <Layout title="My Dashboard">
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Assigned Total', value: stats?.total || 0, icon: ClipboardList, color: '#4f46e5', bg: '#eef2ff' },
                    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: '#f59e0b', bg: '#fefce8' },
                    { label: 'In Progress', value: stats?.inProgress || 0, icon: TrendingUp, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Resolved', value: stats?.resolved || 0, icon: CheckCircle, color: '#10b981', bg: '#f0fdf4' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className="stat-icon" style={{ background: bg }}>
                            <Icon size={22} color={color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 3 }}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
                {/* Chart */}
                <div className="card">
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Workload Overview</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} barSize={36}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, i) => (
                                    <rect key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Complaints */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Recent Assignments</h3>
                    </div>
                    {recentComplaints.length === 0 ? (
                        <div className="empty-state"><ClipboardList size={32} /><h3>No assigned complaints</h3></div>
                    ) : recentComplaints.map(c => (
                        <div key={c._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {c.submittedBy?.name} · {c.category} · {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                            {statusBadge(c.status)}
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
