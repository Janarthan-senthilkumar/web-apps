import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../app/authStore';
import { getErrMsg } from '../utils/helpers';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: 'admin@company.com', password: 'Admin@123' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-blue-700">V</span>
          </div>
          <h1 className="text-3xl font-bold text-white">VendorPay</h1>
          <p className="text-blue-200 mt-1">Invoice & Payment Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Demo Credentials</p>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-medium">Admin</span>
                <span>admin@company.com / Admin@123</span>
              </div>
              <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-medium">Accountant</span>
                <span>priya@company.com / Account@123</span>
              </div>
              <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-medium">Viewer</span>
                <span>ravi@company.com / Viewer@123</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-blue-200 text-sm mt-4">
          Need access? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}
