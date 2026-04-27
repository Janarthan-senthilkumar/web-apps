import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentAPI, invoiceAPI, vendorAPI } from '../api/services';
import { PageHeader } from '../components/common';
import { fmtCurrency, getErrMsg, PAYMENT_MODES } from '../utils/helpers';

export default function PaymentForm() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({
    invoice: sp.get('invoice') ?? '',
    paymentDate: new Date().toISOString().slice(0,10),
    paidAmount: '',
    paymentMode: 'Bank Transfer',
    transactionId: '',
    notes: '',
    paymentRef: `PAY-${Date.now()}`,
  });
  const [loading, setLoading] = useState(false);
useEffect(() => {
  invoiceAPI.getAll({ status: 'Approved,Partially Paid,Overdue', limit: 100 })
    .then(r => {
      console.log('Invoices response:', r.data);
      setInvoices(r.data.invoices || []);
    })
    .catch(err => {
      console.log('Invoice load error:', err);
    });
}, []);
  useEffect(() => {
    if (form.invoice) {
      invoiceAPI.getOne(form.invoice)
        .then(r => setSelectedInvoice(r.data.invoice))
        .catch(() => setSelectedInvoice(null));
    }
  }, [form.invoice]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const outstanding = selectedInvoice ? selectedInvoice.totalAmount - selectedInvoice.paidAmount : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoice) return toast.error('Please select an invoice');
    setLoading(true);
    try {
      await paymentAPI.create(form);
      toast.success('Payment recorded successfully!');
      navigate('/payments');
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Record Payment" />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Payment Reference <span className="text-red-500">*</span></label>
            <input className="input font-mono" value={form.paymentRef} onChange={e=>set('paymentRef',e.target.value)} required />
          </div>
          <div>
            <label className="label">Invoice <span className="text-red-500">*</span></label>
            <select className="input" value={form.invoice} onChange={e=>set('invoice',e.target.value)} required>
              <option value="">Select invoice…</option>
              {invoices.map(inv => (
                <option key={inv._id} value={inv._id}>
                  {inv.invoiceNumber} — {inv.vendor?.vendorName} — Outstanding: {fmtCurrency(inv.totalAmount - inv.paidAmount)}
                </option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Total Amount:</span> <strong>{fmtCurrency(selectedInvoice.totalAmount)}</strong></div>
                <div><span className="text-gray-500">Paid:</span> <strong className="text-green-700">{fmtCurrency(selectedInvoice.paidAmount)}</strong></div>
                <div><span className="text-gray-500">Outstanding:</span> <strong className="text-red-600">{fmtCurrency(outstanding)}</strong></div>
                <div><span className="text-gray-500">Status:</span> <strong>{selectedInvoice.status}</strong></div>
              </div>
            </div>
          )}

          <div>
            <label className="label">Payment Date <span className="text-red-500">*</span></label>
            <input type="date" className="input" value={form.paymentDate} onChange={e=>set('paymentDate',e.target.value)} required />
          </div>
          <div>
            <label className="label">
              Amount Paid <span className="text-red-500">*</span>
              {outstanding > 0 && <span className="text-gray-400 ml-2 text-xs">(max: {fmtCurrency(outstanding)})</span>}
            </label>
            <input type="number" className="input" value={form.paidAmount}
              onChange={e=>set('paidAmount',e.target.value)} required min="0.01"
              max={outstanding || undefined} step="0.01" />
          </div>
          <div>
            <label className="label">Payment Mode</label>
            <select className="input" value={form.paymentMode} onChange={e=>set('paymentMode',e.target.value)}>
              {PAYMENT_MODES.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Transaction ID</label>
            <input className="input" value={form.transactionId} onChange={e=>set('transactionId',e.target.value)} placeholder="UTR / Cheque / UPI ref" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Recording…' : 'Record Payment'}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/payments')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
