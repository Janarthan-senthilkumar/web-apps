import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Search, X, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
    const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
};

const priorityBadge = (p) => <span className={`badge badge-${p?.toLowerCase()}`}>{p}</span>;

export default function StaffComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [responses, setResponses] = useState({});
    const [responseMsg, setResponseMsg] = useState('');
    const [noteMsg, setNoteMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);
            const res = await api.get(`/staff/complaints?${params}`);
            setComplaints(res.data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchComplaints(); }, [search, statusFilter]);

    const openComplaint = async (c) => {
        if (expanded === c._id) { setExpanded(null); return; }
        setExpanded(c._id);
        try {
            const res = await api.get(`/responses/${c._id}`);
            setResponses(prev => ({ ...prev, [c._id]: res.data }));
        } catch { setResponses(prev => ({ ...prev, [c._id]: [] })); }
        setResponseMsg('');
        setNoteMsg(c.notes || '');
    };

    const handleStatusUpdate = async (complaintId, status, notes) => {
        try {
            const res = await api.put(`/staff/complaints/${complaintId}`, { status, notes });
            setComplaints(prev => prev.map(c => c._id === complaintId ? res.data : c));
            toast.success('Updated successfully!');
        } catch { toast.error('Update failed'); }
    };

    const handleRespond = async (complaintId) => {
        if (!responseMsg.trim()) return;
        setSubmitting(true);
        try {
            await api.post('/responses', { complaintId, message: responseMsg });
            toast.success('Response sent!');
            const res = await api.get(`/responses/${complaintId}`);
            setResponses(prev => ({ ...prev, [complaintId]: res.data }));
            setResponseMsg('');
        } catch { toast.error('Failed to send'); } finally { setSubmitting(false); }
    };

    const handleSaveNotes = async (complaintId, status) => {
        await handleStatusUpdate(complaintId, status, noteMsg);
    };

    return (
        <Layout title="Assigned Complaints">
            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
                    </div>
                    <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: '0 0 140px' }}>
                        <option value="">All Status</option>
                        {['Pending', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {(search || statusFilter) && <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); }}><X size={14} /> Clear</button>}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
                ) : complaints.length === 0 ? (
                    <div className="card empty-state"><h3>No complaints assigned to you</h3></div>
                ) : complaints.map(c => (
                    <div key={c._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Header row */}
                        <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center' }} onClick={() => openComplaint(c)}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    {statusBadge(c.status)}
                                    {priorityBadge(c.priority)}
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.category}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {c.submittedBy?.name}</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                            {expanded === c._id ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                        </div>

                        {/* Expanded detail */}
                        {expanded === c._id && (
                            <div style={{ borderTop: '1px solid var(--border)', padding: '20px' }} className="fade-in">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                    {/* Description */}
                                    <div>
                                        <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h4>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7, background: '#f8fafc', padding: 12, borderRadius: 10 }}>{c.description}</p>

                                        {/* Staff notes */}
                                        <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Internal Notes</h4>
                                        <textarea className="input" value={noteMsg} onChange={e => setNoteMsg(e.target.value)} placeholder="Add internal notes..." style={{ minHeight: 70, marginBottom: 8, fontSize: '0.85rem' }} />

                                        {/* Status update */}
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {['Pending', 'In Progress', 'Resolved'].map(s => (
                                                <button key={s} className={`btn btn-sm ${c.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                                    onClick={() => handleSaveNotes(c._id, s)}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Responses thread */}
                                    <div>
                                        <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Responses</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', marginBottom: 10 }}>
                                            {(responses[c._id] || []).length === 0 ? (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No responses yet.</p>
                                            ) : (responses[c._id] || []).map(r => (
                                                <div key={r._id} style={{ background: r.respondedBy?.role === 'user' ? '#f0fdf4' : '#eef2ff', borderRadius: 10, padding: '10px 14px' }}>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                                        <strong style={{ color: 'var(--text)' }}>{r.respondedBy?.name}</strong> ({r.respondedBy?.role}) · {new Date(r.createdAt).toLocaleString('en-IN')}
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{r.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input className="input" placeholder="Send response to student..." value={responseMsg} onChange={e => setResponseMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRespond(c._id)} />
                                            <button className="btn btn-primary" onClick={() => handleRespond(c._id)} disabled={submitting} style={{ flexShrink: 0 }}>
                                                <Send size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Layout>
    );
}
