import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Search, Filter, UserCheck, RefreshCw, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'Pending', 'In Progress', 'Resolved', 'Closed'];
const CATEGORY_OPTIONS = ['', 'Academic', 'Infrastructure', 'Administrative', 'Hostel', 'Library', 'Transport', 'Other'];
const PRIORITY_OPTIONS = ['', 'Low', 'Medium', 'High', 'Critical'];

const statusBadge = (status) => {
    const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
};
const priorityBadge = (p) => <span className={`badge badge-${p?.toLowerCase()}`}>{p}</span>;

export default function AdminComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });
    const [selected, setSelected] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [responses, setResponses] = useState([]);
    const [responseMsg, setResponseMsg] = useState('');
    const [submittingResp, setSubmittingResp] = useState(false);

    const fetchStaff = async () => {
        const res = await api.get('/admin/users?role=staff');
        setStaffList(res.data);
    };

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15, ...filters });
            Object.keys(filters).forEach(k => { if (!filters[k]) params.delete(k); });
            const res = await api.get(`/admin/complaints?${params}`);
            setComplaints(res.data.complaints || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } finally { setLoading(false); }
    }, [page, filters]);

    useEffect(() => { fetchComplaints(); fetchStaff(); }, [fetchComplaints]);

    const openDetail = async (c) => {
        setSelected(c);
        setDetailOpen(true);
        try {
            const res = await api.get(`/responses/${c._id}`);
            setResponses(res.data);
        } catch { setResponses([]); }
    };

    const handleAssign = async (complaintId, staffId) => {
        try {
            await api.put(`/admin/complaints/${complaintId}/assign`, { staffId });
            toast.success(staffId ? 'Complaint assigned!' : 'Assignment removed');
            fetchComplaints();
            if (selected?._id === complaintId) {
                const res = await api.get(`/admin/complaints?page=1&limit=1`);
                // refetch detail
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleStatus = async (complaintId, status) => {
        try {
            await api.put(`/admin/complaints/${complaintId}/status`, { status });
            toast.success(`Status updated to ${status}`);
            fetchComplaints();
            if (selected?._id === complaintId) setSelected(prev => ({ ...prev, status }));
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleRespond = async (e) => {
        e.preventDefault();
        if (!responseMsg.trim()) return;
        setSubmittingResp(true);
        try {
            await api.post('/responses', { complaintId: selected._id, message: responseMsg });
            toast.success('Response sent!');
            setResponseMsg('');
            const res = await api.get(`/responses/${selected._id}`);
            setResponses(res.data);
        } catch { toast.error('Failed to send response'); } finally { setSubmittingResp(false); }
    };

    return (
        <Layout title="All Complaints">
            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input" placeholder="Search complaints..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} style={{ paddingLeft: 32 }} />
                    </div>
                    {[
                        { key: 'status', opts: STATUS_OPTIONS, label: 'Status' },
                        { key: 'category', opts: CATEGORY_OPTIONS, label: 'Category' },
                        { key: 'priority', opts: PRIORITY_OPTIONS, label: 'Priority' },
                    ].map(({ key, opts, label }) => (
                        <select key={key} className="input" value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} style={{ flex: '0 0 140px' }}>
                            <option value="">{label}</option>
                            {opts.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ))}
                    <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status: '', category: '', priority: '', search: '' })}>
                        <X size={14} /> Clear
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.82rem' }}>{total} complaint{total !== 1 ? 's' : ''} found</div>

            {/* Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 16 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th><th>Category</th><th>Priority</th><th>Status</th>
                                <th>Submitted By</th><th>Assigned To</th><th>Date</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                            ) : complaints.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No complaints match your filters</td></tr>
                            ) : complaints.map(c => (
                                <tr key={c._id}>
                                    <td style={{ fontWeight: 500 }}>
                                        <div style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                                    </td>
                                    <td><span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, color: 'var(--text-light)' }}>{c.category}</span></td>
                                    <td>{priorityBadge(c.priority)}</td>
                                    <td>
                                        <select value={c.status} onChange={e => handleStatus(c._id, e.target.value)} style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>
                                            {['Pending', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ fontSize: '0.82rem' }}>
                                        <div>{c.submittedBy?.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.submittedBy?.department}</div>
                                    </td>
                                    <td>
                                        <select value={c.assignedTo?._id || ''} onChange={e => handleAssign(c._id, e.target.value)} style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 8, background: 'white', cursor: 'pointer', maxWidth: 120 }}>
                                            <option value="">Unassigned</option>
                                            {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => openDetail(c)}>
                                            <Eye size={13} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 8 }}>
                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                                background: p === page ? 'var(--primary)' : 'white', color: p === page ? 'white' : 'var(--text)',
                                cursor: 'pointer', fontWeight: p === page ? 600 : 400, fontSize: '0.82rem'
                            }}>{p}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detailOpen && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <div style={{ width: 480, height: '100vh', background: 'white', overflowY: 'auto', padding: 28, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }} className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, flex: 1, paddingRight: 16 }}>{selected.title}</h2>
                            <button onClick={() => setDetailOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} color="var(--text-muted)" /></button>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            {statusBadge(selected.status)}
                            {priorityBadge(selected.priority)}
                            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '3px 10px', borderRadius: '9999px', color: 'var(--text-light)' }}>{selected.category}</span>
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>{selected.description}</p>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div><strong>By:</strong> {selected.submittedBy?.name} ({selected.submittedBy?.email})</div>
                            <div><strong>Dept:</strong> {selected.submittedBy?.department}</div>
                            <div><strong>Assigned:</strong> {selected.assignedTo?.name || 'Unassigned'}</div>
                            <div><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString('en-IN')}</div>
                        </div>

                        {/* Responses */}
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>Responses ({responses.length})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 250, overflowY: 'auto' }}>
                            {responses.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No responses yet.</p> : responses.map(r => (
                                <div key={r._id} style={{ background: r.respondedBy?.role === 'user' ? '#f8fafc' : '#eef2ff', borderRadius: 10, padding: '10px 14px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                        <strong style={{ color: 'var(--text)' }}>{r.respondedBy?.name}</strong> · {r.respondedBy?.role} · {new Date(r.createdAt).toLocaleString('en-IN')}
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{r.message}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleRespond}>
                            <textarea className="input" placeholder="Write a response..." value={responseMsg} onChange={e => setResponseMsg(e.target.value)} style={{ marginBottom: 10, minHeight: 80 }} />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submittingResp}>
                                {submittingResp ? 'Sending...' : 'Send Response'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
