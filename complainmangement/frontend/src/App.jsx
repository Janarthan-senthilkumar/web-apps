import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute, RoleRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStaff from './pages/admin/AdminStaff';

import StaffDashboard from './pages/staff/StaffDashboard';
import StaffComplaints from './pages/staff/StaffComplaints';

import UserDashboard from './pages/user/UserDashboard';
import SubmitComplaint from './pages/user/SubmitComplaint';
import TrackComplaints from './pages/user/TrackComplaints';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/user" replace />;
}

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Admin */}
        <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="/admin/complaints" element={<RoleRoute allowedRoles={['admin']}><AdminComplaints /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>} />
        <Route path="/admin/staff" element={<RoleRoute allowedRoles={['admin']}><AdminStaff /></RoleRoute>} />

        {/* Staff */}
        <Route path="/staff" element={<RoleRoute allowedRoles={['staff']}><StaffDashboard /></RoleRoute>} />
        <Route path="/staff/complaints" element={<RoleRoute allowedRoles={['staff']}><StaffComplaints /></RoleRoute>} />

        {/* User */}
        <Route path="/user" element={<RoleRoute allowedRoles={['user']}><UserDashboard /></RoleRoute>} />
        <Route path="/user/submit" element={<RoleRoute allowedRoles={['user']}><SubmitComplaint /></RoleRoute>} />
        <Route path="/user/complaints" element={<RoleRoute allowedRoles={['user']}><TrackComplaints /></RoleRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
