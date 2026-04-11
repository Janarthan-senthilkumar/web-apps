const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category is required"],
      unique: true,
      enum: ["housing", "food", "transport", "health", "education", "shopping", "utilities", "leisure"],
    },
    label:        { type: String, required: true },
    icon:         { type: String, default: "💰" },
    color:        { type: String, default: "#f59e0b" },
    monthlyLimit: {
      type: Number,
      required: [true, "Monthly limit is required"],
      min: [0, "Monthly limit cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Budget", budgetSchema);
