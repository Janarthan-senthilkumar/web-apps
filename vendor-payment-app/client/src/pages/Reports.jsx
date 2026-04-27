import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { reportAPI } from '../api/services';
import { Table, PageHeader } from '../components/common';
import { fmtDate, fmtCurrency, getErrMsg, downloadCSV } from '../utils/helpers';

const tabs = ['Outstanding Invoices', 'Vendor-wise Payables', 'Payment History'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const fetchReport = async () => {
    setLoading(true);
    setData([]);
    try {
      let res;
      if (activeTab === 0) res = await reportAPI.outstanding(filters);
      else if (activeTab === 1) res = await reportAPI.vendorWise();
      else res = await reportAPI.payments(filters);
      setData(res.data.data);
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };

  const handleExport = () => {
    if (!data.length) return toast.error('No data to export');
    const filename = ['outstanding','vendor-wise','payments'][activeTab];
    downloadCSV(data.map(r => {
      const flat = {};
      Object.entries(r).forEach(([k,v]) => {
        if (typeof v === 'object' && v !== null) flat[k] = v?.vendorName || v?.vendorCode || JSON.stringify(v);
        else flat[k] = v;
      });
      return flat;
    }), `${filename}-report.csv`);
  };

  const outstandingCols = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'invoiceDate', label: 'Invoice Date', render: r => fmtDate(r.invoiceDate) },
    { key: 'dueDate', label: 'Due Date', render: r => fmtDate(r.dueDate) },
    { key: 'totalAmount', label: 'Total', render: r => fmtCurrency(r.totalAmount) },
    { key: 'paidAmount', label: 'Paid', render: r => fmtCurrency(r.paidAmount) },
    { key: 'outstanding', label: 'Outstanding', render: r => <span className="font-semibold text-red-600">{fmtCurrency(r.outstanding)}</span> },
    { key: 'status', label: 'Status', render: r => <span className={`badge ${r.status==='Overdue'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{r.status}</span> },
  ];

  const vendorCols = [
    { key: 'vendorCode', label: 'Code' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'totalInvoices', label: '# Invoices' },
    { key: 'totalAmount', label: 'Total Billed', render: r => fmtCurrency(r.totalAmount) },
    { key: 'paidAmount', label: 'Paid', render: r => fmtCurrency(r.paidAmount) },
    { key: 'outstanding', label: 'Outstanding', render: r => <span className="font-semibold text-red-600">{fmtCurrency(r.outstanding)}</span> },
  ];

  const paymentCols = [
    { key: 'paymentRef', label: 'Ref #' },
    { key: 'vendor', label: 'Vendor', render: r => r.vendor?.vendorName || '—' },
    { key: 'invoice', label: 'Invoice', render: r => r.invoice?.invoiceNumber || '—' },
    { key: 'paymentDate', label: 'Date', render: r => fmtDate(r.paymentDate) },
    { key: 'paidAmount', label: 'Amount', render: r => fmtCurrency(r.paidAmount) },
    { key: 'paymentMode', label: 'Mode' },
    { key: 'transactionId', label: 'Txn ID' },
  ];

  const colsMap = [outstandingCols, vendorCols, paymentCols];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Generate and export financial reports" />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((t, i) => (
            <button key={i} onClick={() => { setActiveTab(i); setData([]); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>{t}</button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab !== 1 && (
        <div className="card p-4 flex flex-wrap gap-3">
          <div>
            <label className="label">From</label>
            <input type="date" className="input w-40" value={filters.startDate} onChange={e => setFilters(p=>({...p, startDate:e.target.value}))} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input w-40" value={filters.endDate} onChange={e => setFilters(p=>({...p, endDate:e.target.value}))} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button className="btn-primary" onClick={fetchReport} disabled={loading}>{loading ? 'Generating…' : 'Generate Report'}</button>
        {data.length > 0 && <button className="btn-secondary" onClick={handleExport}>⬇ Export CSV ({data.length} rows)</button>}
      </div>

      {data.length > 0 && (
        <div className="card">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">{tabs[activeTab]} — {data.length} records</h3>
          </div>
          <Table columns={colsMap[activeTab]} data={data} />
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-lg">📊</p>
          <p className="mt-2 text-sm">Click "Generate Report" to fetch data</p>
        </div>
      )}
    </div>
  );
}
