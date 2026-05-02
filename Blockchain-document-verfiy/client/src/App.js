import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import VerifyDocument from './pages/VerifyDocument';
import Blockchain from './pages/Blockchain';
import AdminPending from './pages/AdminPending';
import AdminUsers from './pages/AdminUsers';
import UserDocuments from './pages/UserDocuments';

const AppShell = ({ children, onAddDocument }) => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Topbar onAddDocument={onAddDocument} />
      {children}
    </div>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell onAddDocument={() => setShowAddModal(true)}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/documents" element={<ProtectedRoute adminOnly><Documents showAddModal={showAddModal} setShowAddModal={setShowAddModal} /></ProtectedRoute>} />
        <Route path="/pending" element={<ProtectedRoute adminOnly><AdminPending /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/blockchain" element={<ProtectedRoute adminOnly><Blockchain /></ProtectedRoute>} />

        {/* User routes */}
        <Route path="/my-documents" element={<ProtectedRoute><UserDocuments /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/verify" element={<ProtectedRoute><VerifyDocument /></ProtectedRoute>} />

        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
          toastStyle={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 14,
            borderRadius: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
