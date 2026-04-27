import { useState } from 'react';
import { reportsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineDocumentChartBar, HiOutlineArrowDownTray } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const reportTypes = [
  { key: 'current-stock', name: 'Current Stock', desc: 'View current stock levels across locations' },
  { key: 'stock-movement', name: 'Stock Movement', desc: 'Track inward/outward movements' },
  { key: 'warehouse-utilization', name: 'Warehouse Utilization', desc: 'Space usage per warehouse' },
  { key: 'inventory-aging', name: 'Inventory Aging', desc: 'Aging buckets analysis' },
  { key: 'reorder', name: 'Reorder Suggestions', desc: 'Items needing reorder' },
  { key: 'expiry', name: 'Expiry Report', desc: 'Near-expiry and expired items' },
  { key: 'supplier-inventory', name: 'Supplier Inventory', desc: 'Stock by supplier' },
  { key: 'category-stock', name: 'Category Stock', desc: 'Stock by category' },
  { key: 'valuation', name: 'Stock Valuation', desc: 'Cost and selling value' },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async (key) => {
    try {
      setLoading(true); setSelectedReport(key); setReportData(null); setSummary(null);
      const apiMap = {
        'current-stock': () => reportsAPI.currentStock(),
        'stock-movement': () => reportsAPI.stockMovement(),
        'warehouse-utilization': () => reportsAPI.warehouseUtilization(),
        'inventory-aging': () => reportsAPI.inventoryAging(),
        'reorder': () => reportsAPI.reorder(),
        'expiry': () => reportsAPI.expiry(),
        'supplier-inventory': () => reportsAPI.supplierInventory(),
        'category-stock': () => reportsAPI.categoryStock(),
        'valuation': () => reportsAPI.valuation(),
      };
      const { data } = await apiMap[key]();
      setReportData(data.data);
      setSummary(data.summary || null);
    } catch (e) { toast.error('Failed to load report'); } finally { setLoading(false); }
  };

  const renderTable = (data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return <p className="text-center text-surface-400 py-8">No data available</p>;
    const items = Array.isArray(data) ? data : Object.values(data).flat().filter(i => typeof i === 'object' && !Array.isArray(i));
    if (items.length === 0) {
      // For aging report which has nested structure
      if (typeof data === 'object' && !Array.isArray(data)) {
        return Object.entries(data).map(([bucket, val]) => (
          <div key={bucket} className="mb-4">
            <h4 className="font-semibold text-surface-900 dark:text-white mb-2">{bucket} days — {val.count || val.length || 0} items {val.totalValue ? `(₹${val.totalValue.toLocaleString()})` : ''}</h4>
            {(val.items || val).length > 0 && (
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b dark:border-surface-700">{Object.keys((val.items || val)[0] || {}).map(k => <th key={k} className="px-3 py-2 text-xs text-surface-500 uppercase">{k}</th>)}</tr></thead><tbody>{(val.items || val).slice(0, 10).map((item, i) => <tr key={i} className="border-b dark:border-surface-700">{Object.values(item).map((v, j) => <td key={j} className="px-3 py-2">{typeof v === 'number' ? v.toLocaleString() : String(v || '-')}</td>)}</tr>)}</tbody></table></div>
            )}
          </div>
        ));
      }
      return <p className="text-center text-surface-400 py-8">No tabular data</p>;
    }
    const keys = Object.keys(items[0]).filter(k => k !== '_id' && k !== '__v');
    return (
      <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-surface-50 dark:bg-surface-800/50"><tr>{keys.map(k => <th key={k} className="px-3 py-2 text-xs font-semibold text-surface-500 uppercase">{k.replace(/([A-Z])/g, ' $1')}</th>)}</tr></thead>
      <tbody className="divide-y divide-surface-200 dark:divide-surface-700">{items.slice(0, 50).map((item, i) => <tr key={i} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">{keys.map(k => {
        const v = item[k]; const display = typeof v === 'object' && v !== null ? (v.name || v.code || JSON.stringify(v)) : typeof v === 'number' ? v.toLocaleString() : String(v || '-');
        return <td key={k} className="px-3 py-2 text-sm">{display}</td>;
      })}</tr>)}</tbody></table></div>
    );
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Reports</h1><p className="text-surface-500 text-sm mt-1">Generate and view inventory reports</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {reportTypes.map((rt) => (
          <button key={rt.key} onClick={() => loadReport(rt.key)} className={`card p-4 text-left hover:shadow-md transition-all ${selectedReport === rt.key ? 'ring-2 ring-primary-500' : ''}`}>
            <div className="flex items-center gap-3"><HiOutlineDocumentChartBar className="w-8 h-8 text-primary-500 flex-shrink-0" /><div><p className="font-medium text-surface-900 dark:text-white text-sm">{rt.name}</p><p className="text-xs text-surface-500">{rt.desc}</p></div></div>
          </button>
        ))}
      </div>

      {selectedReport && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{reportTypes.find(r => r.key === selectedReport)?.name}</h3>
          </div>
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {Object.entries(summary).map(([k, v]) => (
                <div key={k} className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-3">
                  <p className="text-xs text-surface-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="font-semibold text-surface-900 dark:text-white">{typeof v === 'number' ? (v > 1000 ? `₹${v.toLocaleString()}` : v.toLocaleString()) : v}</p>
                </div>
              ))}
            </div>
          )}
          {loading ? <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div> : renderTable(reportData)}
        </div>
      )}
    </div>
  );
}
