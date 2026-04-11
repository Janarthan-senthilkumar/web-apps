const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    interactionType: {
      type: String,
      enum: ["CALL", "EMAIL", "MEETING", "NOTE"],
      default: "NOTE"
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
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
    leadRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead"
    },
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    value: {
      type: Number,
      default: 0
    },
    stage: {
      type: String,
      enum: ["Onboarding", "Active", "Expansion", "Churn Risk"],
      default: "Onboarding"
    },
    interactions: [interactionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
