import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { vendorAPI, invoiceAPI } from '../api/services';
import { Badge, Table, PageHeader } from '../components/common';
import { fmtDate, fmtCurrency, getErrMsg } from '../utils/helpers';
import useAuthStore from '../app/authStore';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [vendor, setVendor] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vendorAPI.getOne(id),
      invoiceAPI.getAll({ vendor: id, limit: 20 }),
    ]).then(([v, inv]) => {
      setVendor(v.data.vendor);
      setInvoices(inv.data.invoices);
    }).catch(() => toast.error('Failed to load vendor'))
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!vendor) return <p className="text-gray-500">Vendor not found</p>;

  const invCols = [
    { key: 'invoiceNumber', label: 'Invoice#', render: r => <Link to={`/invoices/${r._id}`} className="text-blue-600 hover:underline">{r.invoiceNumber}</Link> },
    { key: 'invoiceDate', label: 'Date', render: r => fmtDate(r.invoiceDate) },
    { key: 'dueDate', label: 'Due', render: r => fmtDate(r.dueDate) },
    { key: 'totalAmount', label: 'Amount', render: r => fmtCurrency(r.totalAmount) },
    { key: 'paidAmount', label: 'Paid', render: r => fmtCurrency(r.paidAmount) },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} /> },
  ];

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-50">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={vendor.vendorName} subtitle={`Code: ${vendor.vendorCode}`}
        actions={
          <div className="flex gap-2">
            {['admin','accountant'].includes(user?.role) && (
              <button onClick={() => navigate(`/vendors/${id}/edit`)} className="btn-secondary">Edit</button>
            )}
            <Link to="/vendors" className="btn-secondary">← Back</Link>
          </div>
        } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-0.5">
          <h3 className="font-semibold text-gray-800 mb-3">Contact Info</h3>
          <Row label="Contact Person" value={vendor.contactPerson} />
          <Row label="Email" value={vendor.email} />
          <Row label="Phone" value={vendor.phone} />
          <Row label="Tax ID / GST" value={vendor.taxId} />
          <Row label="Payment Terms" value={vendor.paymentTerms} />
          <Row label="Currency" value={vendor.currency} />
          <Row label="Status" value={<Badge label={vendor.status} />} />
        </div>

        <div className="card p-5 space-y-0.5">
          <h3 className="font-semibold text-gray-800 mb-3">Address</h3>
          <Row label="Street" value={vendor.address?.street} />
          <Row label="City" value={vendor.address?.city} />
          <Row label="State" value={vendor.address?.state} />
          <Row label="Country" value={vendor.address?.country} />
          <Row label="ZIP" value={vendor.address?.zipCode} />
        </div>

        <div className="card p-5 space-y-0.5">
          <h3 className="font-semibold text-gray-800 mb-3">Bank Details</h3>
          <Row label="Bank" value={vendor.bankDetails?.bankName} />
          <Row label="Account Holder" value={vendor.bankDetails?.accountHolder} />
          <Row label="Account Number" value={vendor.bankDetails?.accountNumber} />
          <Row label="IFSC Code" value={vendor.bankDetails?.ifscCode} />
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Invoices</h3>
          {['admin','accountant'].includes(user?.role) && (
            <Link to={`/invoices/new?vendor=${id}`} className="btn-primary btn-sm">+ Invoice</Link>
          )}
        </div>
        <Table columns={invCols} data={invoices} emptyMsg="No invoices for this vendor" />
      </div>
    </div>
  );
}
