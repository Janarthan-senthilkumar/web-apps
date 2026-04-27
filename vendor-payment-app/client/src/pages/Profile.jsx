import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../api/services';
import { PageHeader } from '../components/common';
import { getErrMsg } from '../utils/helpers';
import useAuthStore from '../app/authStore';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;
      const { data } = await authAPI.updateProfile(payload);
      updateUser(data.user);
      toast.success('Profile updated!');
      setForm(p => ({ ...p, password: '', confirm: '' }));
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="My Profile" />
      <div className="max-w-lg">
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="badge bg-blue-100 text-blue-700 mt-1">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="label">New Password <span className="text-gray-400 text-xs">(leave blank to keep current)</span></label>
              <input type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={6} placeholder="••••••••" />
            </div>
            {form.password && (
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" className="input" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} placeholder="••••••••" />
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Update Profile'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
