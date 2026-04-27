import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invoiceAPI, vendorAPI } from '../api/services';
import { PageHeader } from '../components/common';
import { getErrMsg, CATEGORIES } from '../utils/helpers';

const empty = {
  invoiceNumber:'', vendor:'', invoiceDate:'', dueDate:'',
  amount:'', taxAmount:'0', totalAmount:'', currency:'INR',
  category:'Services', description:'', status:'Draft',
};

export default function InvoiceForm() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ ...empty, vendor: sp.get('vendor') || '' });
  const [vendors, setVendors] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    vendorAPI.getAll({ status: 'active', limit: 100 }).then(r => setVendors(r.data.vendors));
    if (isEdit) invoiceAPI.getOne(id).then(r => {
      const inv = r.data.invoice;
      setForm({
        invoiceNumber: inv.invoiceNumber,
        vendor: inv.vendor?._id || inv.vendor,
        invoiceDate: inv.invoiceDate?.slice(0,10),
        dueDate: inv.dueDate?.slice(0,10),
        amount: inv.amount,
        taxAmount: inv.taxAmount,
        totalAmount: inv.totalAmount,
        currency: inv.currency,
        category: inv.category,
        description: inv.description,
        status: inv.status,
      });
    });
  }, [id, isEdit]);

  const set = (k, v) => setForm(p => {
    const next = { ...p, [k]: v };
    if (k === 'amount' || k === 'taxAmount') {
      const amt = parseFloat(k === 'amount' ? v : next.amount) || 0;
      const tax = parseFloat(k === 'taxAmount' ? v : next.taxAmount) || 0;
      next.totalAmount = (amt + tax).toFixed(2);
    }
    return next;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('attachment', file);
      if (isEdit) await invoiceAPI.update(id, fd);
      else await invoiceAPI.create(fd);
      toast.success(isEdit ? 'Invoice updated!' : 'Invoice created!');
      navigate('/invoices');
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Invoice' : 'New Invoice'} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Invoice Number <span className="text-red-500">*</span></label>
              <input className="input uppercase" value={form.invoiceNumber} onChange={e=>set('invoiceNumber',e.target.value)} required placeholder="INV-2024-001" />
            </div>
            <div>
              <label className="label">Vendor <span className="text-red-500">*</span></label>
              <select className="input" value={form.vendor} onChange={e=>set('vendor',e.target.value)} required>
                <option value="">Select vendor…</option>
                {vendors.map(v => <option key={v._id} value={v._id}>{v.vendorName} ({v.vendorCode})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Invoice Date <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.invoiceDate} onChange={e=>set('invoiceDate',e.target.value)} required />
            </div>
            <div>
              <label className="label">Due Date <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)} required />
            </div>
            <div>
              <label className="label">Sub Amount <span className="text-red-500">*</span></label>
              <input type="number" className="input" value={form.amount} onChange={e=>set('amount',e.target.value)} required min="0" step="0.01" />
            </div>
            <div>
              <label className="label">Tax Amount</label>
              <input type="number" className="input" value={form.taxAmount} onChange={e=>set('taxAmount',e.target.value)} min="0" step="0.01" />
            </div>
            <div>
              <label className="label">Total Amount</label>
              <input type="number" className="input bg-gray-50" value={form.totalAmount} readOnly />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={e=>set('currency',e.target.value)}>
                {['INR','USD','EUR','GBP'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e=>set('category',e.target.value)}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
                {['Draft','Submitted'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Attachment</h3>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={e => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <p className="text-xs text-gray-400 mt-1">PDF or image up to 10MB</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : isEdit ? 'Update Invoice' : 'Create Invoice'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/invoices')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
