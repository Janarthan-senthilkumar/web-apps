const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'create', 'update', 'delete', 'login', 'logout',
        'stock-inward', 'stock-outward', 'stock-transfer',
        'stock-adjustment', 'stock-return', 'stock-damaged',
        'alert-created', 'alert-resolved', 'user-created',
        'user-updated', 'settings-changed', 'export', 'import',
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: [
        'user', 'product', 'warehouse', 'zone', 'category',
        'supplier', 'inventory', 'transaction', 'alert', 'settings',
      ],
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true },
    changes: {
      before: { type: mongoose.Schema.Types.Mixed },
      after: { type: mongoose.Schema.Types.Mixed },
    },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
