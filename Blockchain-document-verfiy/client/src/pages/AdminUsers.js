import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getUsers, deleteUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user: me } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget._id);
      toast.success(`User "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div className="page-content">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: users.length, color: 'blue' },
          { label: 'Admins', value: adminCount, color: 'purple' },
          { label: 'Regular Users', value: userCount, color: 'green' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Registered Accounts</div>
            <div className="card-subtitle">All system users</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><h3>No users found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Organization</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`user-avatar-sm ${u.role}`}>{u.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {u.name}
                            {u._id === me?.id && <span style={{ fontSize: 11, color: 'var(--primary)', marginLeft: 6 }}>(you)</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{u.organization || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{fmt(u.createdAt)}</td>
                    <td>
                      {u._id !== me?.id ? (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(u)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
                          </svg>
                          Delete
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--gray-300)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="card-title" style={{ color: 'var(--danger)' }}>Delete User</div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Deleting...</> : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
