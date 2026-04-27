const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Warehouse name is required'], trim: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true },
    },
    capacity: { type: Number, default: 0 },
    currentUtilization: { type: Number, default: 0 },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Warehouse', warehouseSchema);
