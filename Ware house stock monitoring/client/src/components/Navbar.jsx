import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { alertsAPI } from '../services/api';
import {
  HiOutlineBars3, HiOutlineBell, HiOutlineMoon, HiOutlineSun,
  HiOutlineArrowRightOnRectangle, HiOutlineUserCircle, HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

export default function Navbar({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const { data } = await alertsAPI.getStats();
        setUnreadAlerts(data.unreadCount || 0);
      } catch (e) { /* ignore */ }
    };
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
          <HiOutlineBars3 className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-lg px-3 py-2 w-72">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-surface-400" />
          <input type="text" placeholder="Search products, SKUs..." className="bg-transparent border-none outline-none text-sm w-full text-surface-700 dark:text-surface-300 placeholder-surface-400" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
        </button>

        {/* Alerts */}
        <Link to="/alerts" className="relative p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400">
          <HiOutlineBell className="w-5 h-5" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </Link>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-surface-700 dark:text-surface-300">{user?.name}</span>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 py-1 z-50">
                <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700">
                  <HiOutlineUserCircle className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
