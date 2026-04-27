const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Supplier name is required'], trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true },
    },
    website: { type: String, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    leadTimeDays: { type: Number, default: 7 },
    paymentTerms: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);



module.exports = mongoose.model('Supplier', supplierSchema);
