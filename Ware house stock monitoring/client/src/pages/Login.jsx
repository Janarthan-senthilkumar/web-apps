import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineArchiveBox } from 'react-icons/hi2';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-950 via-surface-900 to-accent-950">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-600/20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <HiOutlineArchiveBox className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">StockWatch</h1>
          <p className="text-xl text-surface-300 mb-2">Warehouse Stock Monitoring</p>
          <p className="text-surface-400 max-w-md">Intelligent inventory control with real-time monitoring, demand forecasting, and automated alerts.</p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div><p className="text-2xl font-bold text-primary-400">Real-time</p><p className="text-xs text-surface-400">Stock Updates</p></div>
            <div><p className="text-2xl font-bold text-accent-400">Smart</p><p className="text-xs text-surface-400">Forecasting</p></div>
            <div><p className="text-2xl font-bold text-emerald-400">Auto</p><p className="text-xs text-surface-400">Alerts</p></div>
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineArchiveBox className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">StockWatch</h1>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-surface-400 mb-8">Sign in to your account</p>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                <input
                  type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="admin@warehouse.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
                <input
                  type="password" required value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="mt-6 text-center text-surface-400 text-sm">
              Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one</Link>
            </p>
          </div>
          <p className="mt-4 text-center text-surface-600 text-xs">Demo: admin@warehouse.com / admin123</p>
          <p className="mt-4 text-center text-surface-600 text-xs">Demo: manager@warehouse.com / manager123</p>
          <p className="mt-4 text-center text-surface-600 text-xs">Demo: staff@warehouse.com / staff123</p>
          
        </div>
      </div>
    </div>
  );
}
