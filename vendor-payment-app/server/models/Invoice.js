const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, trim: true, uppercase: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },       // subtotal
  taxAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },  // amount + taxAmount
  paidAmount: { type: Number, default: 0, min: 0 },       // sum of payments
  currency: { type: String, default: 'INR' },
  category: {
    type: String,
    enum: ['Services', 'Goods', 'Utilities', 'Rent', 'Software', 'Consulting', 'Other'],
    default: 'Other',
  },
  description: { type: String },
  attachmentUrl: { type: String },   // file path
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Partially Paid', 'Paid', 'Overdue'],
    default: 'Draft',
  },
  approvalNotes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Compound index: invoice number unique per vendor
invoiceSchema.index({ invoiceNumber: 1, vendor: 1 }, { unique: true });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ vendor: 1 });

// Virtual: outstanding balance
invoiceSchema.virtual('outstandingAmount').get(function () {
  return this.totalAmount - this.paidAmount;
});

invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
