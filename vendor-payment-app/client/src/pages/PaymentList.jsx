import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentAPI } from '../api/services';
import { Badge, Table, Pagination, PageHeader, ConfirmModal } from '../components/common';
import { fmtDate, fmtCurrency, getErrMsg } from '../utils/helpers';
import useAuthStore from '../app/authStore';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function PaymentList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 10;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await paymentAPI.getAll({ ...filters, page, limit });
      setPayments(data.payments);
      setTotal(data.total);
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await paymentAPI.delete(deleteId);
      toast.success('Payment deleted and invoice updated');
      setDeleteId(null);
      fetchPayments();
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'paymentRef', label: 'Ref #', render: r => <span className="font-mono text-blue-600">{r.paymentRef}</span> },
    { key: 'vendor', label: 'Vendor', render: r => r.vendor?.vendorName || '—' },
    { key: 'invoice', label: 'Invoice', render: r => (
      <Link to={`/invoices/${r.invoice?._id}`} className="text-blue-600 hover:underline">{r.invoice?.invoiceNumber || '—'}</Link>
    )},
    { key: 'paymentDate', label: 'Date', render: r => fmtDate(r.paymentDate) },
    { key: 'paidAmount', label: 'Amount', render: r => <span className="font-semibold text-green-700">{fmtCurrency(r.paidAmount)}</span> },
    { key: 'paymentMode', label: 'Mode' },
    { key: 'transactionId', label: 'Txn ID' },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} /> },
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-1">
        {user?.role === 'admin' && (
          <button onClick={() => setDeleteId(r._id)} className="btn btn-sm btn-danger">Del</button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle={`${total} payment records`}
        actions={['admin','accountant'].includes(user?.role) && (
          <Link to="/payments/new" className="btn-primary"><PlusIcon className="w-4 h-4" />Record Payment</Link>
        )} />

      <div className="card p-4 mb-4 flex gap-3">
        <input type="date" className="input w-44" value={filters.startDate}
          onChange={e => setFilters(p=>({...p, startDate: e.target.value}))} />
        <input type="date" className="input w-44" value={filters.endDate}
          onChange={e => setFilters(p=>({...p, endDate: e.target.value}))} />
        <button className="btn-secondary" onClick={() => setFilters({ startDate:'', endDate:'' })}>Clear</button>
      </div>

      <div className="card">
        <Table columns={columns} data={payments} loading={loading} emptyMsg="No payment records found" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </div>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        message="This will delete the payment and recalculate the invoice balance." />
    </div>
  );
}
