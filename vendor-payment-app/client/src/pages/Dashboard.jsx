import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  BuildingOfficeIcon, DocumentTextIcon, ClockIcon,
  ExclamationCircleIcon, CheckCircleIcon, CurrencyRupeeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { dashboardAPI } from '../api/services';
import { fmtCurrency, MONTHS } from '../utils/helpers';
import { StatCard } from '../components/common';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

const formatMonth = (item) => MONTHS[(item._id?.month || 1) - 1];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getSummary()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const { summary, charts } = data || {};

  const monthlyData = (charts?.monthlyInvoices || []).map(item => ({
    month: formatMonth(item),
    Invoices: item.total,
    Payments: charts?.monthlyPayments?.find(p => p._id?.month === item._id?.month && p._id?.year === item._id?.year)?.total || 0,
  }));

  const statusData = (charts?.statusBreakdown || []).map(s => ({ name: s._id, value: s.count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your vendor payment operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Vendors" value={summary?.totalVendors || 0} icon={BuildingOfficeIcon} color="blue" />
        <StatCard title="Total Invoices" value={summary?.totalInvoices || 0} icon={DocumentTextIcon} color="indigo" />
        <StatCard title="Pending Approval" value={summary?.pendingApprovals || 0} icon={ClockIcon} color="yellow"
          subtitle={<Link to="/invoices?status=Submitted" className="text-yellow-600 hover:underline text-xs">View all</Link>} />
        <StatCard title="Overdue Invoices" value={summary?.overdueInvoices || 0} icon={ExclamationCircleIcon} color="red" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Paid Invoices" value={summary?.paidInvoices || 0} icon={CheckCircleIcon} color="green" />
        <StatCard title="Outstanding Amount" value={fmtCurrency(summary?.outstandingAmount)} icon={CurrencyRupeeIcon} color="purple" />
        <StatCard title="Due in 7 Days" value={summary?.dueIn7Days || 0} icon={CalendarDaysIcon} color="yellow"
          subtitle="Needs attention" />
        <div className="card p-5 flex items-center justify-center">
          <Link to="/invoices/new" className="btn-primary text-sm">+ New Invoice</Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Bar Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Invoices vs Payments</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => fmtCurrency(v)} />
                <Legend />
                <Bar dataKey="Invoices" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="Payments" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No data yet</p>}
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Invoice Status Breakdown</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false} fontSize={10}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No data yet</p>}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/vendors/new', label: 'Add Vendor', color: 'blue' },
          { to: '/invoices/new', label: 'Create Invoice', color: 'indigo' },
          { to: '/payments/new', label: 'Record Payment', color: 'green' },
          { to: '/reports', label: 'View Reports', color: 'purple' },
        ].map(({ to, label, color }) => (
          <Link key={to} to={to}
            className={`card p-4 text-center text-sm font-semibold text-${color}-700 hover:bg-${color}-50 transition-colors`}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
