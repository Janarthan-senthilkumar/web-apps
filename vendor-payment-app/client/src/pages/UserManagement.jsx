import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userAPI } from '../api/services';
import { Table, PageHeader, Modal, ConfirmModal, Badge } from '../components/common';
import { fmtDate, getErrMsg } from '../utils/helpers';
import useAuthStore from '../app/authStore';

export default function UserManagement() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try { const { data } = await userAPI.getAll(); setUsers(data.users); }
    catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.update(editUser._id, { name: editUser.name, role: editUser.role, isActive: editUser.isActive });
      toast.success('User updated');
      setEditUser(null);
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userAPI.delete(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      load();
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: r => <span className="font-medium">{r.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: r => <Badge label={r.role} /> },
    { key: 'isActive', label: 'Status', render: r => <Badge label={r.isActive ? 'active' : 'inactive'} /> },
    { key: 'lastLogin', label: 'Last Login', render: r => fmtDate(r.lastLogin) },
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-2">
        {r._id !== me?._id && (
          <>
            <button onClick={() => setEditUser({...r})} className="btn btn-sm btn-secondary">Edit</button>
            <button onClick={() => setDeleteId(r._id)} className="btn btn-sm btn-danger">Delete</button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage team members and roles"
        actions={<Link to="/register" className="btn-primary">Add User</Link>}
      />
      <div className="card">
        <Table columns={columns} data={users} loading={loading} emptyMsg="No users found" />
      </div>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="sm">
        {editUser && (
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="accountant">Accountant</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={editUser.isActive ? 'active' : 'inactive'}
                onChange={e => setEditUser({...editUser, isActive: e.target.value === 'active'})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              <button className="btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} message="This user will be permanently deleted from the system." />
    </div>
  );
}
