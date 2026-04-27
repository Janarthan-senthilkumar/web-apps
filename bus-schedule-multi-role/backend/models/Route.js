const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  arrivalOffset: { type: Number, default: 0 }, // minutes from departure
  distanceFromSource: { type: Number, default: 0 }, // km
});

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: [true, 'Route number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    stops: [stopSchema],
    totalDistance: {
      type: Number,
      required: [true, 'Total distance is required'],
      min: 0,
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: [true, 'Estimated duration is required'],
      min: 1,
    },
    routeType: {
      type: String,
      enum: ['City', 'Interstate', 'Local', 'Express Highway'],
      default: 'City',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Under Review'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
