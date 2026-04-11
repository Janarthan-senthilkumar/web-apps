const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ["CALL", "EMAIL", "MEETING", "DEMO"],
      default: "CALL"
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "MISSED"],
      default: "PENDING"
    },
    completedAt: Date,
    outcome: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

followUpSchema.index({ dueDate: 1, status: 1, assignedTo: 1 });

module.exports = mongoose.model("FollowUp", followUpSchema);
