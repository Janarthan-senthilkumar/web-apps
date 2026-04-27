const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

/**
 * Recalculate invoice paidAmount and update status based on payments.
 */
const recalculateInvoiceStatus = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return;

  const payments = await Payment.find({ invoice: invoiceId, status: 'Completed' });
  const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);

  invoice.paidAmount = totalPaid;

  const now = new Date();
  if (totalPaid >= invoice.totalAmount) {
    invoice.status = 'Paid';
  } else if (totalPaid > 0) {
    invoice.status = 'Partially Paid';
  } else if (invoice.dueDate < now && invoice.status !== 'Rejected' && invoice.status !== 'Draft') {
    invoice.status = 'Overdue';
  } else if (invoice.status === 'Paid' || invoice.status === 'Partially Paid' || invoice.status === 'Overdue') {
    // reset to Approved if payments removed
    invoice.status = 'Approved';
  }

  await invoice.save();
  return invoice;
};

/**
 * Cron job: Mark all approved/submitted invoices with past due date as Overdue.
 */
const updateOverdueInvoices = async () => {
  const result = await Invoice.updateMany(
    {
      dueDate: { $lt: new Date() },
      status: { $in: ['Submitted', 'Approved'] },
      paidAmount: 0,
    },
    { $set: { status: 'Overdue' } }
  );
  console.log(`Overdue update: ${result.modifiedCount} invoices marked overdue`);
  return result;
};

module.exports = { recalculateInvoiceStatus, updateOverdueInvoices };
