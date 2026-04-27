const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'low-stock',
        'out-of-stock',
        'overstock',
        'near-expiry',
        'expired',
        'abnormal-movement',
        'reorder-threshold',
        'system',
      ],
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    emailSent: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

alertSchema.index({ type: 1 });
alertSchema.index({ isRead: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
