const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    busName: {
      type: String,
      required: [true, 'Bus name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Express', 'Ordinary', 'Super Deluxe', 'Sleeper', 'AC', 'Non-AC'],
      required: [true, 'Bus type is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [10, 'Capacity must be at least 10'],
      max: [100, 'Capacity cannot exceed 100'],
    },
    operator: {
      type: String,
      default: 'State Transport',
      trim: true,
    },
    amenities: [
      {
        type: String,
        enum: ['WiFi', 'AC', 'Charging Port', 'GPS', 'CCTV', 'Water Bottle'],
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bus', busSchema);
