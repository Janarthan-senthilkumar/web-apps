import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { fetchCurrentUser } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineUserCircle } from 'react-icons/hi2';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [tab, setTab] = useState('profile');
  const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try { setLoading(true); await authAPI.updateProfile(profileData); await dispatch(fetchCurrentUser()); toast.success('Profile updated'); } catch (e) { toast.error('Update failed'); } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Passwords do not match');
    try { setLoading(true); await authAPI.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }); toast.success('Password changed'); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h1><p className="text-surface-500 text-sm mt-1">Manage your account</p></div>

      {/* Avatar & Info */}
      <div className="card p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div><h2 className="text-xl font-bold text-surface-900 dark:text-white">{user?.name}</h2><p className="text-surface-500">{user?.email}</p><span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 capitalize">{user?.role}</span></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
        {['profile', 'password'].map((t) => <button key={t} onClick={() => setTab(t)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>{t === 'password' ? 'Change Password' : 'Edit Profile'}</button>)}
      </div>

      {tab === 'profile' ? (
        <div className="card p-6">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Full Name</label><input required value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label><input disabled value={user?.email || ''} className="input-field opacity-50 cursor-not-allowed" /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label><input value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="input-field" /></div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      ) : (
        <div className="card p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Current Password</label><input required type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">New Password</label><input required type="password" minLength={6} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Confirm New Password</label><input required type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-field" /></div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
