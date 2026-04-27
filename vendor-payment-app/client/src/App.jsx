import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './app/authStore';
import AppLayout from './layouts/AppLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VendorList from './pages/VendorList';
import VendorForm from './pages/VendorForm';
import VendorDetail from './pages/VendorDetail';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import PaymentList from './pages/PaymentList';
import PaymentForm from './pages/PaymentForm';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<PrivateRoute roles={['admin']}><Register /></PrivateRoute>} />

        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="vendors" element={<VendorList />} />
          <Route path="vendors/new" element={<PrivateRoute roles={['admin','accountant']}><VendorForm /></PrivateRoute>} />
          <Route path="vendors/:id" element={<VendorDetail />} />
          <Route path="vendors/:id/edit" element={<PrivateRoute roles={['admin','accountant']}><VendorForm /></PrivateRoute>} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/new" element={<PrivateRoute roles={['admin','accountant']}><InvoiceForm /></PrivateRoute>} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="invoices/:id/edit" element={<PrivateRoute roles={['admin','accountant']}><InvoiceForm /></PrivateRoute>} />
          <Route path="payments" element={<PaymentList />} />
          <Route path="payments/new" element={<PrivateRoute roles={['admin','accountant']}><PaymentForm /></PrivateRoute>} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
