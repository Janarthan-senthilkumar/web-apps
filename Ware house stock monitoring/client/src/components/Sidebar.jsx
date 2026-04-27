import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiOutlineChartBarSquare, HiOutlineCube, HiOutlineBuildingOffice2,
  HiOutlineClipboardDocumentList, HiOutlineArrowsRightLeft, HiOutlineBellAlert,
  HiOutlineDocumentChartBar, HiOutlineUsers, HiOutlineCog6Tooth,
  HiOutlineArchiveBox, HiOutlineXMark,
} from 'react-icons/hi2';

const navItems = [
  { path: '/dashboard', name: 'Dashboard', icon: HiOutlineChartBarSquare },
  { path: '/products', name: 'Products', icon: HiOutlineCube },
  { path: '/warehouses', name: 'Warehouses', icon: HiOutlineBuildingOffice2 },
  { path: '/inventory', name: 'Inventory', icon: HiOutlineArchiveBox },
  { path: '/transactions', name: 'Transactions', icon: HiOutlineArrowsRightLeft },
  { path: '/alerts', name: 'Alerts', icon: HiOutlineBellAlert },
  { path: '/reports', name: 'Reports', icon: HiOutlineDocumentChartBar, roles: ['admin', 'manager'] },
  { path: '/users', name: 'Users', icon: HiOutlineUsers, roles: ['admin', 'manager'] },
  { path: '/settings', name: 'Settings', icon: HiOutlineCog6Tooth },
];

export default function Sidebar({ open, setOpen }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <HiOutlineArchiveBox className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div>
                <h1 className="text-sm font-bold text-surface-900 dark:text-white leading-tight">StockWatch</h1>
                <p className="text-[10px] text-surface-500 font-medium">Warehouse Monitor</p>
              </div>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-surface-500 hover:text-surface-700">
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {open && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {open && user && (
          <div className="p-4 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-surface-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
