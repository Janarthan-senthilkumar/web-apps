import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../app/authStore';
import {
  HomeIcon, BuildingOfficeIcon, DocumentTextIcon,
  CreditCardIcon, ChartBarIcon, UsersIcon,
  UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, exact: true },
  { to: '/vendors', label: 'Vendors', icon: BuildingOfficeIcon },
  { to: '/invoices', label: 'Invoices', icon: DocumentTextIcon },
  { to: '/payments', label: 'Payments', icon: CreditCardIcon },
  { to: '/reports', label: 'Reports', icon: ChartBarIcon },
];

const adminItems = [
  { to: '/users', label: 'Users', icon: UsersIcon },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-800">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg">V</div>
        <span className="text-white font-bold text-lg">VendorPay</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">Main Menu</p>
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <p className="px-3 pt-4 pb-1 text-xs font-semibold text-blue-300 uppercase tracking-wider">Admin</p>
            {adminItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-blue-800 p-3">
        <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors" onClick={() => setSidebarOpen(false)}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout}
          className="mt-1 flex items-center gap-3 w-full px-3 py-2 rounded-lg text-blue-100 hover:bg-blue-800 hover:text-white text-sm transition-colors">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-blue-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-blue-900 z-10">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <NavLink to="/profile" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <UserCircleIcon className="w-6 h-6" />
              <span className="hidden sm:block">{user?.name}</span>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
