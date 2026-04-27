import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineCog6Tooth, HiOutlineMoon, HiOutlineSun, HiOutlineBellAlert } from 'react-icons/hi2';

export default function Settings() {
  const { user } = useSelector((state) => state.auth);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState({ email: true, inApp: true, lowStock: true, expiry: true });

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1><p className="text-surface-500 text-sm mt-1">Configure application preferences</p></div>

      {/* Appearance */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2"><HiOutlineCog6Tooth className="w-5 h-5" /> Appearance</h3>
        <div className="flex items-center justify-between py-3 border-b border-surface-200 dark:border-surface-700">
          <div><p className="font-medium text-surface-900 dark:text-white text-sm">Dark Mode</p><p className="text-xs text-surface-500">Toggle dark/light theme</p></div>
          <button onClick={toggleDark} className={`relative w-14 h-7 rounded-full transition-colors ${darkMode ? 'bg-primary-600' : 'bg-surface-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : ''} flex items-center justify-center`}>
              {darkMode ? <HiOutlineMoon className="w-3 h-3 text-primary-600" /> : <HiOutlineSun className="w-3 h-3 text-amber-500" />}
            </span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2"><HiOutlineBellAlert className="w-5 h-5" /> Notifications</h3>
        {[
          { key: 'email', label: 'Email Notifications', desc: 'Receive critical alerts via email' },
          { key: 'inApp', label: 'In-App Notifications', desc: 'Show notifications in the app' },
          { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified for low stock items' },
          { key: 'expiry', label: 'Expiry Alerts', desc: 'Get notified for near-expiry items' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-surface-200 dark:border-surface-700 last:border-0">
            <div><p className="font-medium text-surface-900 dark:text-white text-sm">{item.label}</p><p className="text-xs text-surface-500">{item.desc}</p></div>
            <button onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} className={`relative w-14 h-7 rounded-full transition-colors ${notifications[item.key] ? 'bg-primary-600' : 'bg-surface-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-7' : ''}`} />
            </button>
          </div>
        ))}
      </div>

      {/* System Info */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-surface-500">Version</p><p className="font-medium text-surface-900 dark:text-white">1.0.0</p></div>
          <div><p className="text-surface-500">Your Role</p><p className="font-medium text-surface-900 dark:text-white capitalize">{user?.role || 'N/A'}</p></div>
          <div><p className="text-surface-500">Environment</p><p className="font-medium text-surface-900 dark:text-white">Development</p></div>
          <div><p className="text-surface-500">API Endpoint</p><p className="font-medium text-surface-900 dark:text-white">/api</p></div>
        </div>
      </div>
    </div>
  );
}
