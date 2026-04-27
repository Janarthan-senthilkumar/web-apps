const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Zone name is required'], trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    type: {
      type: String,
      enum: ['zone', 'rack', 'bin', 'shelf', 'aisle'],
      default: 'zone',
    },
    parentZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
    capacity: { type: Number, default: 0 },
    currentUtilization: { type: Number, default: 0 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);



module.exports = mongoose.model('Zone', zoneSchema);
