const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    availableQuantity: { type: Number, default: 0, min: 0 },
    batchNumber: { type: String, trim: true },
    lotNumber: { type: String, trim: true },
    expiryDate: { type: Date, default: null },
    costPrice: { type: Number, default: 0 },
    lastRestockedAt: { type: Date },
    lastMovementAt: { type: Date },
    status: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock', 'overstock', 'expired'],
      default: 'in-stock',
    },
  },
  { timestamps: true }
);

inventorySchema.index({ product: 1, warehouse: 1, zone: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ expiryDate: 1 });

// Virtual for available qty
inventorySchema.pre('save', function (next) {
  this.availableQuantity = this.quantity - this.reservedQuantity;
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
