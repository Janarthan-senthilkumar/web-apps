import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineMagnifyingGlass, HiOutlineArrowPath } from 'react-icons/hi2';
import { transactionsAPI } from '../services/api';

const TRANSACTION_TYPES = ['inward', 'outward', 'transfer', 'adjustment', 'return', 'damaged', 'expired'];
const STATUS_OPTIONS = ['pending', 'completed', 'cancelled', 'rejected'];

const typeBadgeStyles = {
  inward: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  outward: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  transfer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  adjustment: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  return: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  damaged: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  expired: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
};

const statusBadgeStyles = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const toLabel = (value = '') =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatCurrency = (value) => {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, search, filters.type, filters.status]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const query = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search.trim()) query.search = search.trim();
      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;

      const { data } = await transactionsAPI.getAll(query);
      setTransactions(data.data || []);
      setPagination((prev) => ({ ...prev, ...(data.pagination || {}) }));
    } catch (error) {
      setTransactions([]);
      toast.error(error.response?.status === 404 ? 'Transactions endpoint is unavailable' : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Transactions</h1>
          <p className="text-surface-500 text-sm mt-1">Track inward, outward, transfer, and adjustment activity.</p>
        </div>
        <button onClick={fetchTransactions} className="btn-secondary flex items-center gap-2 w-fit">
          <HiOutlineArrowPath className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setSearch(e.target.value);
              }}
              placeholder="Search by reference or remarks..."
              className="input-field pl-9"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setFilters((prev) => ({ ...prev, type: e.target.value }));
            }}
            className="select-field w-auto min-w-[150px]"
          >
            <option value="">All Types</option>
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {toLabel(type)}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setFilters((prev) => ({ ...prev, status: e.target.value }));
            }}
            className="select-field w-auto min-w-[140px]"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {toLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-50 dark:bg-surface-800/50">
              <tr>
                {['Reference', 'Type', 'Product', 'Quantity', 'From', 'To', 'Cost', 'Status', 'Date'].map((header) => (
                  <th key={header} className="px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-surface-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-primary-600 dark:text-primary-400">
                      {txn.referenceNumber || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeStyles[txn.type] || typeBadgeStyles.inward}`}>
                        {toLabel(txn.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{txn.product?.name || '-'}</p>
                      <p className="text-xs text-surface-500 font-mono">{txn.product?.sku || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{txn.quantity?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{txn.sourceWarehouse?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{txn.destinationWarehouse?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(txn.totalCost ?? txn.unitCost)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeStyles[txn.status] || statusBadgeStyles.completed}`}>
                        {toLabel(txn.status || 'completed')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-500">{txn.createdAt ? new Date(txn.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} records)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-sm rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
