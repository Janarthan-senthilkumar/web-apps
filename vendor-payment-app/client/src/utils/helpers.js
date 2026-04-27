import { format, parseISO, isValid } from 'date-fns';

export const fmtDate = (d) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? parseISO(d) : d;
  return isValid(date) ? format(date, 'dd MMM yyyy') : '—';
};

export const fmtCurrency = (amt, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amt || 0);

export const statusColors = {
  Draft: 'bg-gray-100 text-gray-600',
  Submitted: 'bg-blue-100 text-blue-700',
  Approved: 'bg-indigo-100 text-indigo-700',
  Rejected: 'bg-red-100 text-red-700',
  'Partially Paid': 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  Overdue: 'bg-rose-100 text-rose-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Failed: 'bg-red-100 text-red-700',
};

export const INVOICE_STATUSES = ['Draft','Submitted','Approved','Rejected','Partially Paid','Paid','Overdue'];
export const PAYMENT_MODES = ['Bank Transfer','UPI','Cash','Cheque','Card','Other'];
export const CATEGORIES = ['Services','Goods','Utilities','Rent','Software','Consulting','Other'];
export const PAYMENT_TERMS = ['Net 15','Net 30','Net 45','Net 60','Immediate','Custom'];

export const getErrMsg = (err) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || err?.message || 'Something went wrong';

export const downloadCSV = (rows, filename) => {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
