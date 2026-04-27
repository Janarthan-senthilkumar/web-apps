const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus is required'],
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route is required'],
    },
    departureTime: {
      type: String, // "HH:MM" format
      required: [true, 'Departure time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    daysOfOperation: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      required: [true, 'Days of operation are required'],
    },
    fare: {
      type: Number,
      required: [true, 'Fare is required'],
      min: [0, 'Fare cannot be negative'],
    },
    availableSeats: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['On Time', 'Delayed', 'Cancelled', 'Completed'],
      default: 'On Time',
    },
    platform: {
      type: String,
      default: 'TBD',
    },
  },
  { timestamps: true }
);

// Virtual to check if schedule runs today
scheduleSchema.virtual('runsToday').get(function () {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = days[new Date().getDay()];
  return this.daysOfOperation.includes(today);
});

scheduleSchema.set('toJSON', { virtuals: true });
scheduleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
