const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: [true, 'SKU is required'], unique: true, uppercase: true, trim: true },
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    barcode: { type: String, trim: true },
    qrCode: { type: String, trim: true },
    unitOfMeasure: {
      type: String,
      enum: ['pcs', 'kg', 'ltr', 'box', 'pack', 'carton', 'pallet', 'meter', 'sqft', 'units'],
      default: 'pcs',
    },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    reorderLevel: { type: Number, default: 10, min: 0 },
    reorderQuantity: { type: Number, default: 50, min: 0 },
    maxStockThreshold: { type: Number, default: 500, min: 0 },
    expiryDate: { type: Date, default: null },
    batchNumber: { type: String, trim: true },
    leadTimeDays: { type: Number, default: 7 },
    weight: { type: Number, default: 0 },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    imageUrl: { type: String, default: '' },
    demandHistory: [
      {
        month: { type: String },
        year: { type: Number },
        quantity: { type: Number, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued', 'pending'],
      default: 'active',
    },
    tags: [{ type: String, trim: true }],
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);


productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ status: 1 });

module.exports = mongoose.model('Product', productSchema);
