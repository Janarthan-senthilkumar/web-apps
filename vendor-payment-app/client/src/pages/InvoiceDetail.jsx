import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invoiceAPI, paymentAPI } from '../api/services';
import { Badge, Table, Modal, PageHeader } from '../components/common';
import { fmtDate, fmtCurrency, getErrMsg } from '../utils/helpers';
import useAuthStore from '../app/authStore';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [inv, pays] = await Promise.all([
        invoiceAPI.getOne(id),
        paymentAPI.getAll({ invoice: id }),
      ]);
      setInvoice(inv.data.invoice);
      setPayments(pays.data.payments);
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    setActing(true);
    try { await invoiceAPI.submit(id); toast.success('Invoice submitted'); load(); }
    catch (err) { toast.error(getErrMsg(err)); }
    finally { setActing(false); }
  };

  const handleApprove = async () => {
    setActing(true);
    try { await invoiceAPI.approve(id, { notes }); toast.success('Invoice approved'); setApproveModal(false); load(); }
    catch (err) { toast.error(getErrMsg(err)); }
    finally { setActing(false); }
  };

  const handleReject = async () => {
    setActing(true);
    try { await invoiceAPI.reject(id, { notes }); toast.success('Invoice rejected'); setRejectModal(false); load(); }
    catch (err) { toast.error(getErrMsg(err)); }
    finally { setActing(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!invoice) return <p className="text-gray-500">Invoice not found</p>;

  const outstanding = invoice.totalAmount - invoice.paidAmount;
  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value ?? '—'}</span>
    </div>
  );

  const payCols = [
    { key: 'paymentRef', label: 'Ref #' },
    { key: 'paymentDate', label: 'Date', render: r => fmtDate(r.paymentDate) },
    { key: 'paidAmount', label: 'Amount', render: r => fmtCurrency(r.paidAmount) },
    { key: 'paymentMode', label: 'Mode' },
    { key: 'transactionId', label: 'Txn ID' },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Invoice ${invoice.invoiceNumber}`} subtitle={invoice.vendor?.vendorName}
        actions={
          <div className="flex flex-wrap gap-2">
            {/* Status actions */}
            {['Draft','Rejected'].includes(invoice.status) && ['admin','accountant'].includes(user?.role) && (
              <button onClick={handleSubmit} disabled={acting} className="btn-primary btn-sm">Submit</button>
            )}
            {invoice.status === 'Submitted' && user?.role === 'admin' && (
              <>
                <button onClick={() => { setNotes(''); setApproveModal(true); }} className="btn-success btn-sm">Approve</button>
                <button onClick={() => { setNotes(''); setRejectModal(true); }} className="btn-danger btn-sm">Reject</button>
              </>
            )}
            {['Approved','Partially Paid','Overdue'].includes(invoice.status) && ['admin','accountant'].includes(user?.role) && (
              <Link to={`/payments/new?invoice=${id}`} className="btn-primary btn-sm">Record Payment</Link>
            )}
            {['admin','accountant'].includes(user?.role) && !['Paid','Approved'].includes(invoice.status) && (
              <button onClick={() => navigate(`/invoices/${id}/edit`)} className="btn-secondary btn-sm">Edit</button>
            )}
            <Link to="/invoices" className="btn-secondary btn-sm">← Back</Link>
          </div>
        } />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Invoice Amount', value: fmtCurrency(invoice.totalAmount), color: 'text-gray-900' },
          { label: 'Paid Amount', value: fmtCurrency(invoice.paidAmount), color: 'text-green-700' },
          { label: 'Outstanding', value: fmtCurrency(outstanding), color: outstanding > 0 ? 'text-red-600' : 'text-green-700' },
          { label: 'Status', value: <Badge label={invoice.status} />, color: '' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Invoice Information</h3>
          <Row label="Invoice Number" value={<span className="font-mono">{invoice.invoiceNumber}</span>} />
          <Row label="Vendor" value={<Link to={`/vendors/${invoice.vendor?._id}`} className="text-blue-600 hover:underline">{invoice.vendor?.vendorName}</Link>} />
          <Row label="Invoice Date" value={fmtDate(invoice.invoiceDate)} />
          <Row label="Due Date" value={fmtDate(invoice.dueDate)} />
          <Row label="Category" value={invoice.category} />
          <Row label="Currency" value={invoice.currency} />
          <Row label="Description" value={invoice.description} />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Amount Breakdown</h3>
          <Row label="Sub Total" value={fmtCurrency(invoice.amount)} />
          <Row label="Tax Amount" value={fmtCurrency(invoice.taxAmount)} />
          <Row label="Total Amount" value={<span className="font-bold">{fmtCurrency(invoice.totalAmount)}</span>} />
          <Row label="Paid Amount" value={<span className="text-green-700">{fmtCurrency(invoice.paidAmount)}</span>} />
          <Row label="Outstanding" value={<span className={outstanding > 0 ? 'text-red-600 font-bold' : 'text-green-700'}>{fmtCurrency(outstanding)}</span>} />
          {invoice.approvedBy && <Row label="Approved By" value={invoice.approvedBy?.name} />}
          {invoice.approvalNotes && <Row label="Notes" value={invoice.approvalNotes} />}
          {invoice.attachmentUrl && (
            <div className="py-2">
              <a href={invoice.attachmentUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm inline-flex">
                📎 View Attachment
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Payments */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Payment History ({payments.length})</h3>
        </div>
        <Table columns={payCols} data={payments} emptyMsg="No payments recorded yet" />
      </div>

      {/* Approve Modal */}
      <Modal open={approveModal} onClose={() => setApproveModal(false)} title="Approve Invoice" size="sm">
        <p className="text-sm text-gray-600 mb-3">Add optional notes before approving.</p>
        <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Approval notes…" />
        <div className="flex gap-3 mt-4">
          <button className="btn-success flex-1 justify-center" onClick={handleApprove} disabled={acting}>
            {acting ? 'Approving…' : 'Approve'}
          </button>
          <button className="btn-secondary" onClick={() => setApproveModal(false)}>Cancel</button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Invoice" size="sm">
        <p className="text-sm text-gray-600 mb-3">Please provide a reason for rejection.</p>
        <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Rejection reason…" required />
        <div className="flex gap-3 mt-4">
          <button className="btn-danger flex-1 justify-center" onClick={handleReject} disabled={acting}>
            {acting ? 'Rejecting…' : 'Reject'}
          </button>
          <button className="btn-secondary" onClick={() => setRejectModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
