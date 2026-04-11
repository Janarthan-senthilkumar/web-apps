import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Users, Briefcase } from 'lucide-react';

export default function AdminStaff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [complaintCounts, setComplaintCounts] = useState({});

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await api.get('/admin/users?role=staff');
                setStaff(res.data);

                // Get all complaints to count per staff
                const cRes = await api.get('/admin/complaints?limit=200&page=1');
                const counts = {};
                (cRes.data.complaints || []).forEach(c => {
                    if (c.assignedTo?._id) {
                        counts[c.assignedTo._id] = counts[c.assignedTo._id] || { total: 0, inProgress: 0, resolved: 0 };
                        counts[c.assignedTo._id].total++;
                        if (c.status === 'In Progress') counts[c.assignedTo._id].inProgress++;
                        if (c.status === 'Resolved' || c.status === 'Closed') counts[c.assignedTo._id].resolved++;
                    }
                });
                setComplaintCounts(counts);
            } finally { setLoading(false); }
        };
        fetchStaff();
    }, []);

    return (
        <Layout title="Staff Management">
            <div className="page-header">
                <h1>Staff Overview</h1>
                <p>Workload and complaint assignments for all staff members</p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {staff.map(s => {
                        const cnt = complaintCounts[s._id] || { total: 0, inProgress: 0, resolved: 0 };
                        const pct = cnt.total > 0 ? Math.round((cnt.resolved / cnt.total) * 100) : 0;
                        return (
                            <div key={s._id} className="card" style={{ padding: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                                        {s.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.email}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>
                                            <Briefcase size={11} style={{ display: 'inline', marginRight: 4 }} />{s.department || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                                    {[
                                        { label: 'Total', value: cnt.total, color: '#4f46e5' },
                                        { label: 'In Progress', value: cnt.inProgress, color: '#3b82f6' },
                                        { label: 'Resolved', value: cnt.resolved, color: '#10b981' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '10px 6px' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolution rate</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>{pct}%</span>
                                    </div>
                                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>

                                <div style={{ marginTop: 12 }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 9px', borderRadius: '9999px', background: s.isActive ? '#d1fae5' : '#fee2e2', color: s.isActive ? '#065f46' : '#991b1b' }}>
                                        {s.isActive ? '● Active' : '○ Inactive'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {staff.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                            <Users size={36} />
                            <h3>No staff members found</h3>
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}
