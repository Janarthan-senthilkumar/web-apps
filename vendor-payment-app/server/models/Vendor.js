const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: { type: String, required: true, trim: true },
  vendorCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  contactPerson: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  taxId: { type: String, trim: true },   // GST / VAT / PAN
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolder: String,
  },
  paymentTerms: {
    type: String,
    enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Immediate', 'Custom'],
    default: 'Net 30',
  },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

vendorSchema.index({ vendorName: 'text', vendorCode: 'text', email: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);
