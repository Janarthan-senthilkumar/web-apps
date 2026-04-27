import { useState, useEffect } from 'react';
import { inventoryAPI, warehousesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ warehouse: '', status: '' });

  useEffect(() => {
    fetchInventory();
    warehousesAPI.getAll({ limit: 50 }).then((r) => setWarehouses(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchInventory(); }, [pagination.page, search, filters]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await inventoryAPI.getAll({ page: pagination.page, limit: pagination.limit, search, ...filters });
      setInventory(data.data);
      setPagination(data.pagination);
    } catch (e) { toast.error('Failed to load inventory'); } finally { setLoading(false); }
  };

  const statusBadge = (status) => {
    const colors = {
      'in-stock': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'low-stock': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'out-of-stock': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'overstock': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'expired': 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors['in-stock']}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Inventory</h1>
        <p className="text-surface-500 text-sm mt-1">View stock levels across all warehouses</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product name or SKU..."
              className="input-field pl-9" />
          </div>
          <select value={filters.warehouse} onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })} className="select-field w-auto min-w-[150px]">
            <option value="">All Warehouses</option>
            {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="select-field w-auto min-w-[130px]">
            <option value="">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="overstock">Overstock</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-50 dark:bg-surface-800/50">
              <tr>
                {['Product', 'SKU', 'Warehouse', 'Zone', 'Quantity', 'Available', 'Cost Price', 'Value', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-surface-400">No inventory records found</td></tr>
              ) : (
                inventory.map((inv) => (
                  <tr key={inv._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-white">{inv.product?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-primary-600 dark:text-primary-400">{inv.product?.sku || '-'}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{inv.warehouse?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{inv.zone?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{inv.quantity?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{inv.availableQuantity?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">₹{inv.costPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-medium">₹{(inv.quantity * inv.costPrice).toLocaleString()}</td>
                    <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">Page {pagination.page} of {pagination.pages} ({pagination.total} records)</p>
            <div className="flex gap-1">
              <button onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })} disabled={pagination.page === 1} className="px-3 py-1 text-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-40">Prev</button>
              <button onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })} disabled={pagination.page === pagination.pages} className="px-3 py-1 text-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
