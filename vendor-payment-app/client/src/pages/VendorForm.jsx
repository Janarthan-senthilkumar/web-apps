import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { vendorAPI } from '../api/services';
import { PageHeader } from '../components/common';
import { getErrMsg, PAYMENT_TERMS } from '../utils/helpers';

const empty = {
  vendorName: '',
  vendorCode: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: { street: '', city: '', state: '', country: 'India', zipCode: '' },
  taxId: '',
  bankDetails: { bankName: '', accountNumber: '', ifscCode: '', accountHolder: '' },
  paymentTerms: 'Net 30',
  currency: 'INR',
  status: 'active',
  notes: '',
};

function Field({ label, name, type = 'text', required, children, form, setField }) {
  const value = name.split('.').reduce((o, k) => o?.[k], form) ?? '';

  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children || (
        <input
          type={type}
          className="input"
          value={value}
          onChange={(e) => setField(name, e.target.value)}
          required={required}
        />
      )}
    </div>
  );
}

export default function VendorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      vendorAPI
        .getOne(id)
        .then((r) => setForm(r.data.vendor))
        .catch(() => toast.error('Failed to load vendor'));
    }
  }, [id, isEdit]);

  const setField = (path, val) => {
    const keys = path.split('.');
    setForm((prev) => {
      const next = { ...prev };
      if (keys.length === 2) {
        next[keys[0]] = { ...next[keys[0]], [keys[1]]: val };
      } else {
        next[keys[0]] = val;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) await vendorAPI.update(id, form);
      else await vendorAPI.create(form);

      toast.success(isEdit ? 'Vendor updated!' : 'Vendor created!');
      navigate('/vendors');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Vendor' : 'Add Vendor'} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vendor Name" name="vendorName" required form={form} setField={setField} />
            <Field label="Vendor Code" name="vendorCode" required form={form} setField={setField} />
            <Field label="Contact Person" name="contactPerson" form={form} setField={setField} />
            <Field label="Email" name="email" type="email" form={form} setField={setField} />
            <Field label="Phone" name="phone" form={form} setField={setField} />
            <Field label="Tax ID / GST" name="taxId" form={form} setField={setField} />

            <Field label="Payment Terms" name="paymentTerms" form={form} setField={setField}>
              <select
                className="input"
                value={form.paymentTerms}
                onChange={(e) => setField('paymentTerms', e.target.value)}
              >
                {PAYMENT_TERMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Currency" name="currency" form={form} setField={setField}>
              <select
                className="input"
                value={form.currency}
                onChange={(e) => setField('currency', e.target.value)}
              >
                {['INR', 'USD', 'EUR', 'GBP'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Status" name="status" form={form} setField={setField}>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Street" name="address.street" form={form} setField={setField} />
            <Field label="City" name="address.city" form={form} setField={setField} />
            <Field label="State" name="address.state" form={form} setField={setField} />
            <Field label="Country" name="address.country" form={form} setField={setField} />
            <Field label="ZIP Code" name="address.zipCode" form={form} setField={setField} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Bank Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank Name" name="bankDetails.bankName" form={form} setField={setField} />
            <Field label="Account Holder" name="bankDetails.accountHolder" form={form} setField={setField} />
            <Field label="Account Number" name="bankDetails.accountNumber" form={form} setField={setField} />
            <Field label="IFSC Code" name="bankDetails.ifscCode" form={form} setField={setField} />
          </div>
        </div>

        <div className="card p-6">
          <label className="label">Notes</label>
          <textarea
            className="input"
            rows={3}
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update Vendor' : 'Create Vendor'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/vendors')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}