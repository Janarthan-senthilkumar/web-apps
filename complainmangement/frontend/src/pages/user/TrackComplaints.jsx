import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Search, ChevronDown, ChevronUp, Paperclip, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusBadge = (status) => {
    const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
};
const priorityBadge = (p) => <span className={`badge badge-${p?.toLowerCase()}`}>{p}</span>;

const StatusTimeline = ({ status }) => {
    const steps = ['Pending', 'In Progress', 'Resolved'];
    const idx = steps.indexOf(status === 'Closed' ? 'Resolved' : status);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 12 }}>
            {steps.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            background: i <= idx ? (i === idx ? '#4f46e5' : '#10b981') : '#e2e8f0',
                            color: i <= idx ? 'white' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700,
                            boxShadow: i === idx ? '0 0 0 4px rgba(79,70,229,0.15)' : 'none',
                            transition: 'all 0.3s'
                        }}>
                            {i < idx ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: i <= idx ? 600 : 400, color: i <= idx ? 'var(--text)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{ flex: 1, height: 3, margin: '-16px 4px 0', background: i < idx ? '#10b981' : '#e2e8f0', borderRadius: 2, transition: 'background 0.3s' }} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default function TrackComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [responses, setResponses] = useState({});

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/my');
            setComplaints(res.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchComplaints();
        const interval = setInterval(fetchComplaints, 10000);
        return () => clearInterval(interval);
    }, []);

    const openDetail = async (c) => {
        if (expanded === c._id) { setExpanded(null); return; }
        setExpanded(c._id);
        if (!responses[c._id]) {
            try {
                const res = await api.get(`/responses/${c._id}`);
                setResponses(prev => ({ ...prev, [c._id]: res.data }));
            } catch { setResponses(prev => ({ ...prev, [c._id]: [] })); }
        }
    };

    const filtered = complaints.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout title="My Complaints">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
                    <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Search your complaints..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
                </div>
                <Link to="/user/submit" className="btn btn-primary">+ New Complaint</Link>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="card empty-state">
                    <MessageSquare size={36} />
                    <h3>{search ? 'No matching complaints' : 'No complaints yet'}</h3>
                    {!search && <Link to="/user/submit" className="btn btn-primary" style={{ marginTop: 12 }}>Submit your first complaint</Link>}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(c => (
                        <div key={c._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start' }} onClick={() => openDetail(c)}>
                                {/* Status dot */}
                                <div style={{
                                    width: 10, height: 10, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                                    background: { Pending: '#f59e0b', 'In Progress': '#3b82f6', Resolved: '#10b981', Closed: '#94a3b8' }[c.status] || '#94a3b8'
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                        {statusBadge(c.status)}
                                        {priorityBadge(c.priority)}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.category}</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Clock size={11} />{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        {c.attachments?.length > 0 && (
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Paperclip size={11} />{c.attachments.length} file(s)
                                            </span>
                                        )}
                                        {c.assignedTo && (
                                            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '9999px' }}>
                                                Assigned: {c.assignedTo.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {expanded === c._id ? <ChevronUp size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} /> : <ChevronDown size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />}
                            </div>

                            {/* Expanded panel */}
                            {expanded === c._id && (
                                <div style={{ borderTop: '1px solid var(--border)', padding: '20px' }} className="fade-in">
                                    {/* Status timeline */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress Timeline</div>
                                        <StatusTimeline status={c.status} />
                                    </div>

                                    {/* Description */}
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Complaint</div>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7, background: '#f8fafc', padding: '12px 14px', borderRadius: 10 }}>{c.description}</p>
                                    </div>

                                    {/* Responses */}
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Responses from Staff / Admin
                                        </div>
                                        {(responses[c._id] || []).length === 0 ? (
                                            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                                                <MessageSquare size={20} color="var(--text-muted)" style={{ margin: '0 auto 6px' }} />
                                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No responses yet. We'll notify you once our team responds.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {(responses[c._id] || []).map(r => (
                                                    <div key={r._id} style={{ background: '#eef2ff', borderLeft: '3px solid #4f46e5', borderRadius: '0 10px 10px 0', padding: '12px 16px' }}>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                                            <strong style={{ color: '#4f46e5' }}>{r.respondedBy?.name}</strong>
                                                            <span style={{ background: '#e0e7ff', borderRadius: '9999px', padding: '1px 7px', marginLeft: 6, color: '#3730a3', fontWeight: 600 }}>{r.respondedBy?.role}</span>
                                                            <span style={{ marginLeft: 8 }}>{new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>{r.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Attachments */}
                                    {c.attachments?.length > 0 && (
                                        <div style={{ marginTop: 16 }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attachments</div>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {c.attachments.map((a, i) => (
                                                    <a key={i} href={`/uploads/${a.filename}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', borderRadius: 8, padding: '6px 12px', fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none', border: '1px solid #e2e8f0' }}>
                                                        <Paperclip size={13} />{a.originalName}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
