import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff', phone: '' });

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const fetchUsers = async () => {
    try { setLoading(true); const { data } = await usersAPI.getAll({ search, role: roleFilter, limit: 50 }); setUsers(data.data); } catch (e) { toast.error('Failed'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) { await usersAPI.update(editItem._id, formData); toast.success('User updated'); }
      else { await usersAPI.create(formData); toast.success('User created'); }
      setShowModal(false); setEditItem(null); fetchUsers();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => { if (!confirm('Deactivate this user?')) return; try { await usersAPI.delete(id); toast.success('User deactivated'); fetchUsers(); } catch (e) {} };
  const roleBadge = (r) => { const c = { admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', staff: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400' }; return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${c[r] || c.staff}`}>{r}</span>; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Users</h1><p className="text-surface-500 text-sm mt-1">Manage user accounts and roles</p></div>
        <button onClick={() => { setEditItem(null); setFormData({ name: '', email: '', password: '', role: 'staff', phone: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-5 h-5" /> Add User</button>
      </div>
      <div className="card p-4"><div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative"><HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9" /></div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="select-field w-auto min-w-[120px]"><option value="">All Roles</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="staff">Staff</option></select>
      </div></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-surface-50 dark:bg-surface-800/50"><tr>{['Name', 'Email', 'Role', 'Phone', 'Status', 'Last Login', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-xs font-semibold text-surface-500 uppercase">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">{loading ? <tr><td colSpan={7} className="py-12 text-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr> : users.length === 0 ? <tr><td colSpan={7} className="py-12 text-center text-surface-400">No users</td></tr> : users.map(u => (
          <tr key={u._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
            <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-semibold">{u.name?.[0]?.toUpperCase()}</div><span className="text-sm font-medium text-surface-900 dark:text-white">{u.name}</span></div></td>
            <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{u.email}</td>
            <td className="px-4 py-3">{roleBadge(u.role)}</td>
            <td className="px-4 py-3 text-sm text-surface-500">{u.phone || '-'}</td>
            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
            <td className="px-4 py-3 text-sm text-surface-500">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
            <td className="px-4 py-3"><div className="flex gap-1">
              <button onClick={() => { setEditItem(u); setFormData({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"><HiOutlinePencilSquare className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-500 hover:text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
            </div></td>
          </tr>))}</tbody></table></div></div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md"><div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700"><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{editItem ? 'Edit User' : 'New User'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Name *</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Email *</label><input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-field" /></div>
              {!editItem && <div><label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Password *</label><input required type="password" minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input-field" /></div>}
              <div><label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Role</label><select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="select-field"><option value="staff">Staff</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div>
              <div><label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">Phone</label><input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input-field" /></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editItem ? 'Update' : 'Create'}</button></div>
            </form></div></div>
      )}
    </div>
  );
}
