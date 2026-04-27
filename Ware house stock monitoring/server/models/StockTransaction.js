const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      required: true,
      enum: ['inward', 'outward', 'transfer', 'adjustment', 'return', 'damaged', 'expired'],
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, default: 0 },
    newQuantity: { type: Number, default: 0 },
    sourceWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    sourceZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    destinationWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    destinationZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    batchNumber: { type: String, trim: true },
    unitCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'rejected'],
      default: 'completed',
    },
    remarks: { type: String, trim: true },
    reason: { type: String, trim: true },
  },
  { timestamps: true }
);


stockTransactionSchema.index({ type: 1 });
stockTransactionSchema.index({ product: 1 });
stockTransactionSchema.index({ createdAt: -1 });
stockTransactionSchema.index({ performedBy: 1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
