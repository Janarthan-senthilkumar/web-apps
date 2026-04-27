import { useState, useEffect } from 'react';
import { alertsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineBellAlert, HiOutlineCheck, HiOutlineCheckCircle, HiOutlineXMark } from 'react-icons/hi2';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', severity: '', isRead: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchAlerts(); }, [pagination.page, filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await alertsAPI.getAll({ page: pagination.page, limit: pagination.limit, ...filter });
      setAlerts(data.data); setPagination(data.pagination); setUnreadCount(data.unreadCount || 0);
    } catch (e) { toast.error('Failed to load alerts'); } finally { setLoading(false); }
  };

  const markAsRead = async (id) => { try { await alertsAPI.markAsRead(id); fetchAlerts(); } catch (e) {} };
  const resolveAlert = async (id) => { try { await alertsAPI.resolve(id); toast.success('Alert resolved'); fetchAlerts(); } catch (e) {} };
  const markAllRead = async () => { try { await alertsAPI.markAllAsRead(); toast.success('All alerts marked as read'); fetchAlerts(); } catch (e) {} };

  const severityColors = { info: 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/10', warning: 'border-l-amber-400 bg-amber-50 dark:bg-amber-900/10', critical: 'border-l-red-400 bg-red-50 dark:bg-red-900/10' };
  const severityBadge = (s) => { const c = { info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }; return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c[s] || c.info}`}>{s}</span>; };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Alert Center</h1><p className="text-surface-500 text-sm mt-1">{unreadCount} unread alerts</p></div>
        <button onClick={markAllRead} className="btn-secondary flex items-center gap-2"><HiOutlineCheckCircle className="w-4 h-4" /> Mark All Read</button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} className="select-field w-auto min-w-[150px]">
            <option value="">All Types</option>
            {['low-stock', 'out-of-stock', 'overstock', 'near-expiry', 'expired', 'abnormal-movement', 'reorder-threshold'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filter.severity} onChange={(e) => setFilter({ ...filter, severity: e.target.value })} className="select-field w-auto min-w-[120px]">
            <option value="">All Severity</option>
            {['info', 'warning', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filter.isRead} onChange={(e) => setFilter({ ...filter, isRead: e.target.value })} className="select-field w-auto min-w-[120px]">
            <option value="">All</option><option value="false">Unread</option><option value="true">Read</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        : alerts.length === 0 ? <div className="card p-12 text-center"><HiOutlineBellAlert className="w-12 h-12 text-surface-300 mx-auto mb-4" /><p className="text-surface-500">No alerts found</p></div>
        : alerts.map((alert) => (
          <div key={alert._id} className={`card border-l-4 p-4 ${severityColors[alert.severity]} ${!alert.isRead ? 'ring-1 ring-primary-200 dark:ring-primary-800' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {severityBadge(alert.severity)}
                  <span className="text-xs text-surface-400 capitalize">{alert.type}</span>
                  {!alert.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />}
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-white text-sm">{alert.title}</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">{alert.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                  {alert.product && <span>Product: {alert.product.name}</span>}
                  {alert.warehouse && <span>Warehouse: {alert.warehouse.name}</span>}
                  <span>{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-1 ml-4">
                {!alert.isRead && <button onClick={() => markAsRead(alert._id)} className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-400" title="Mark as read"><HiOutlineCheck className="w-4 h-4" /></button>}
                {!alert.isResolved && <button onClick={() => resolveAlert(alert._id)} className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-surface-400 hover:text-emerald-600" title="Resolve"><HiOutlineCheckCircle className="w-4 h-4" /></button>}
              </div>
            </div>
            {alert.isResolved && <p className="text-xs text-emerald-600 mt-2">✓ Resolved by {alert.resolvedBy?.name || 'System'} at {new Date(alert.resolvedAt).toLocaleString()}</p>}
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })} disabled={pagination.page === 1} className="btn-secondary disabled:opacity-40">Previous</button>
          <span className="px-4 py-2 text-sm text-surface-500">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })} disabled={pagination.page === pagination.pages} className="btn-secondary disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
