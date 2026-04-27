const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentRef: { type: String, required: true, unique: true, uppercase: true, trim: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  paymentDate: { type: Date, required: true },
  paidAmount: { type: Number, required: true, min: 0.01 },
  paymentMode: {
    type: String,
    enum: ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Card', 'Other'],
    default: 'Bank Transfer',
  },
  transactionId: { type: String, trim: true },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

paymentSchema.index({ vendor: 1 });
paymentSchema.index({ invoice: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
