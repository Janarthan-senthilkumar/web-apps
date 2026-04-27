import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardStats, fetchMovementChart, fetchWarehouseSummary,
  fetchCategoryDistribution, fetchTopConsumed, fetchRecentActivity,
} from '../store/slices/dashboardSlice';
import {
  HiOutlineCube, HiOutlineBuildingOffice2, HiOutlineArchiveBox,
  HiOutlineExclamationTriangle, HiOutlineArrowTrendingDown, HiOutlineArrowTrendingUp,
  HiOutlineClock, HiOutlineBanknotes, HiOutlineArrowDownTray, HiOutlineArrowUpTray,
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];

function StatCard({ title, value, icon: Icon, color, subtext }) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600', green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600', yellow: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600', teal: 'from-teal-500 to-teal-600',
    indigo: 'from-indigo-500 to-indigo-600', pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtext && <p className="text-xs text-surface-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, movementChart, warehouseSummary, categoryDistribution, topConsumed, recentActivity, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchMovementChart());
    dispatch(fetchWarehouseSummary());
    dispatch(fetchCategoryDistribution());
    dispatch(fetchTopConsumed());
    dispatch(fetchRecentActivity());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats || {};

  const pieData = categoryDistribution?.map((c, i) => ({ name: c.category, value: c.totalQuantity })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-surface-500 text-sm mt-1">Real-time warehouse monitoring overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard title="Total Products" value={s.totalProducts || 0} icon={HiOutlineCube} color="indigo" />
        <StatCard title="Total Stock" value={s.totalStock || 0} icon={HiOutlineArchiveBox} color="blue" />
        <StatCard title="Warehouses" value={s.totalWarehouses || 0} icon={HiOutlineBuildingOffice2} color="teal" />
        <StatCard title="Low Stock" value={s.lowStock || 0} icon={HiOutlineArrowTrendingDown} color="yellow" />
        <StatCard title="Out of Stock" value={s.outOfStock || 0} icon={HiOutlineExclamationTriangle} color="red" />
        <StatCard title="Overstock" value={s.overstock || 0} icon={HiOutlineArrowTrendingUp} color="purple" />
        <StatCard title="Near Expiry" value={s.nearExpiry || 0} icon={HiOutlineClock} color="pink" />
        <StatCard title="Inbound Today" value={s.inboundToday || 0} icon={HiOutlineArrowDownTray} color="green" subtext={`${s.inboundCountToday || 0} transactions`} />
        <StatCard title="Outbound Today" value={s.outboundToday || 0} icon={HiOutlineArrowUpTray} color="blue" subtext={`${s.outboundCountToday || 0} transactions`} />
        <StatCard title="Stock Valuation" value={`₹${(s.stockValuation || 0).toLocaleString()}`} icon={HiOutlineBanknotes} color="green" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movement Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Stock Movement Trends</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={movementChart || []}>
                <defs>
                  <linearGradient id="colorInward" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutward" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} /><stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="inward" stroke="#6366f1" fill="url(#colorInward)" strokeWidth={2} name="Inward" />
                <Area type="monotone" dataKey="outward" stroke="#14b8a6" fill="url(#colorOutward)" strokeWidth={2} name="Outward" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Category Distribution</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#94a3b8' }}>
                  {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Summary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Warehouse Summary</h3>
          {warehouseSummary?.length > 0 ? (
            <div className="space-y-3">
              {warehouseSummary.map((wh, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white text-sm">{wh.warehouseName}</p>
                    <p className="text-xs text-surface-500">{wh.totalItems} items • ₹{(wh.totalValue || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-surface-900 dark:text-white">{(wh.totalQuantity || 0).toLocaleString()}</p>
                    <div className="flex gap-2 text-xs">
                      {wh.lowStockCount > 0 && <span className="text-amber-500">{wh.lowStockCount} low</span>}
                      {wh.outOfStockCount > 0 && <span className="text-red-500">{wh.outOfStockCount} out</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-center py-8">No warehouse data available</p>
          )}
        </div>

        {/* Top Consumed / Fast Moving */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Top Consumed (30 days)</h3>
          {topConsumed?.length > 0 ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={topConsumed.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis dataKey="product.name" type="category" width={120} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="totalOutward" fill="#6366f1" radius={[0, 6, 6, 0]} name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-surface-400 text-center py-8">No consumption data yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Activity</h3>
        {recentActivity?.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 hover:bg-surface-50 dark:hover:bg-surface-700/30 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                  {activity.user?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-700 dark:text-surface-300">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-surface-400">{activity.user?.name || 'System'}</span>
                    <span className="text-xs text-surface-300">•</span>
                    <span className="text-xs text-surface-400">{new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <span className="text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 px-2 py-1 rounded-lg capitalize whitespace-nowrap">{activity.action}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-surface-400 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
}
