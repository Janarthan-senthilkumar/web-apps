const mongoose = require("mongoose");
const { LEAD_STATUSES } = require("../utils/constants");

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      default: "Manual"
    },
    estimatedValue: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "NEW"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    notes: {
      type: String,
      default: ""
    },
    tags: [{ type: String }],
    nextFollowUpDate: Date,
    lastFollowUpAt: Date,
    convertedAt: Date,
    convertedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    }
  },
  { timestamps: true }
);

leadSchema.index({ status: 1, assignedTo: 1, createdAt: -1 });
leadSchema.index({ fullName: "text", email: "text", company: "text" });

module.exports = mongoose.model("Lead", leadSchema);
