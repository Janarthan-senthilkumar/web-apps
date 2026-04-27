import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../api/services';
import { Badge, Table, Pagination, PageHeader, ConfirmModal } from '../components/common';
import { fmtDate, fmtCurrency, INVOICE_STATUSES, CATEGORIES, getErrMsg } from '../utils/helpers';
import useAuthStore from '../app/authStore';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function InvoiceList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: searchParams.get('status') || '', category: '', startDate: '', endDate: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 10;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await invoiceAPI.getAll({ ...filters, page, limit });
      setInvoices(data.invoices);
      setTotal(data.total);
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const setF = (k, v) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await invoiceAPI.delete(deleteId);
      toast.success('Invoice deleted');
      setDeleteId(null);
      fetchInvoices();
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: r => (
      <Link to={`/invoices/${r._id}`} className="font-mono font-semibold text-blue-600 hover:underline">{r.invoiceNumber}</Link>
    )},
    { key: 'vendor', label: 'Vendor', render: r => (
      <span className="font-medium text-gray-800">{r.vendor?.vendorName || '—'}</span>
    )},
    { key: 'invoiceDate', label: 'Date', render: r => fmtDate(r.invoiceDate) },
    { key: 'dueDate', label: 'Due Date', render: r => (
      <span className={new Date(r.dueDate) < new Date() && !['Paid','Rejected'].includes(r.status) ? 'text-red-600 font-medium' : ''}>
        {fmtDate(r.dueDate)}
      </span>
    )},
    { key: 'totalAmount', label: 'Amount', render: r => fmtCurrency(r.totalAmount) },
    { key: 'paidAmount', label: 'Paid', render: r => fmtCurrency(r.paidAmount) },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} /> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-1">
        <button onClick={() => navigate(`/invoices/${r._id}`)} className="btn btn-sm btn-secondary">View</button>
        {['admin','accountant'].includes(user?.role) && !['Paid','Approved'].includes(r.status) && (
          <button onClick={() => navigate(`/invoices/${r._id}/edit`)} className="btn btn-sm btn-secondary">Edit</button>
        )}
        {user?.role === 'admin' && r.paidAmount === 0 && (
          <button onClick={() => setDeleteId(r._id)} className="btn btn-sm btn-danger">Del</button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${total} invoices total`}
        actions={['admin','accountant'].includes(user?.role) && (
          <Link to="/invoices/new" className="btn-primary"><PlusIcon className="w-4 h-4" />New Invoice</Link>
        )} />

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search invoice #" value={filters.search}
              onChange={e => setF('search', e.target.value)} />
          </div>
          <select className="input" value={filters.status} onChange={e => setF('status', e.target.value)}>
            <option value="">All Status</option>
            {INVOICE_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input" value={filters.category} onChange={e => setF('category', e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="date" className="input" value={filters.startDate} onChange={e => setF('startDate', e.target.value)} placeholder="From" />
          <input type="date" className="input" value={filters.endDate} onChange={e => setF('endDate', e.target.value)} placeholder="To" />
        </div>
      </div>

      <div className="card">
        <Table columns={columns} data={invoices} loading={loading} emptyMsg="No invoices found" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </div>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        message="This will permanently delete the invoice. This action cannot be undone." />
    </div>
  );
}
