import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Search, Trash2, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = ['', 'user', 'staff', 'admin'];

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            const res = await api.get(`/admin/users?${params}`);
            setUsers(res.data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [search, roleFilter]);

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch { toast.error('Failed to delete user'); }
    };

    const startEdit = (u) => {
        setEditing(u._id);
        setEditForm({ name: u.name, role: u.role, department: u.department || '', isActive: u.isActive });
    };

    const saveEdit = async (id) => {
        try {
            await api.put(`/admin/users/${id}`, editForm);
            toast.success('User updated');
            setEditing(null);
            fetchUsers();
        } catch { toast.error('Failed to update user'); }
    };

    const roleBadge = (role) => {
        const map = { admin: { bg: '#f5f3ff', color: '#6d28d9' }, staff: { bg: '#eff6ff', color: '#1d4ed8' }, user: { bg: '#f0fdf4', color: '#065f46' } };
        const s = map[role] || {};
        return <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px', borderRadius: '9999px', background: s.bg, color: s.color }}>{role}</span>;
    };

    return (
        <Layout title="User Management">
            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
                    </div>
                    <select className="input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ flex: '0 0 130px' }}>
                        <option value="">All Roles</option>
                        {ROLE_OPTIONS.filter(Boolean).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 16 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th><th>Email</th><th>Role</th><th>Department</th>
                                <th>Status</th><th>Joined</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No users found</td></tr>
                            ) : users.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        {editing === u._id ? (
                                            <input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.82rem' }} />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0 }}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{u.name}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{u.email}</td>
                                    <td>
                                        {editing === u._id ? (
                                            <select className="input" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.82rem' }}>
                                                {['user', 'staff', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        ) : roleBadge(u.role)}
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                                        {editing === u._id ? (
                                            <input className="input" value={editForm.department} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.82rem' }} />
                                        ) : (u.department || '—')}
                                    </td>
                                    <td>
                                        {editing === u._id ? (
                                            <select className="input" value={String(editForm.isActive)} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.value === 'true' }))} style={{ padding: '4px 8px', fontSize: '0.82rem' }}>
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 9px', borderRadius: '9999px', background: u.isActive ? '#d1fae5' : '#fee2e2', color: u.isActive ? '#065f46' : '#991b1b' }}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {editing === u._id ? (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => saveEdit(u._id)}><Check size={13} /></button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}><X size={13} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(u)}><Edit2 size={13} /></button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id, u.name)}><Trash2 size={13} /></button>
                                                </>
                                            )}
                                        </div>
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
