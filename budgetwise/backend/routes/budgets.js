const express = require("express");
const router  = express.Router();
const Budget  = require("../models/Budget");
const Expense = require("../models/Expense");

// ─── GET all budgets with current month spending ──────────────────────────────
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find().sort({ category: 1 });

    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const spending = await Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: "$category", spent: { $sum: "$amount" } } },
    ]);

    const spendMap = {};
    spending.forEach((s) => (spendMap[s._id] = s.spent));

    const enriched = budgets.map((b) => ({
      ...b.toObject(),
      spent:     spendMap[b.category] || 0,
      remaining: b.monthlyLimit - (spendMap[b.category] || 0),
      utilization: Math.round(((spendMap[b.category] || 0) / b.monthlyLimit) * 100),
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET single budget by category ───────────────────────────────────────────
router.get("/:category", async (req, res) => {
  try {
    const budget = await Budget.findOne({ category: req.params.category });
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT update budget limit ──────────────────────────────────────────────────
router.put("/:category", async (req, res) => {
  try {
    const { monthlyLimit } = req.body;

    if (!monthlyLimit || monthlyLimit <= 0)
      return res.status(400).json({ success: false, message: "Monthly limit must be a positive number" });

    const budget = await Budget.findOneAndUpdate(
      { category: req.params.category },
      { monthlyLimit },
      { new: true, runValidators: true }
    );

    if (!budget)
      return res.status(404).json({ success: false, message: "Budget category not found" });

    res.json({ success: true, data: budget, message: "Budget updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT bulk update budgets ──────────────────────────────────────────────────
router.put("/", async (req, res) => {
  try {
    const { budgets } = req.body;
    if (!budgets || typeof budgets !== "object")
      return res.status(400).json({ success: false, message: "Budgets object required" });

    const updates = Object.entries(budgets).map(([category, monthlyLimit]) =>
      Budget.findOneAndUpdate({ category }, { monthlyLimit }, { new: true, runValidators: true })
    );

    const results = await Promise.all(updates);
    res.json({ success: true, data: results.filter(Boolean), message: "Budgets updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
