const express = require("express");
const router  = express.Router();
const Expense = require("../models/Expense");

// ─── GET all expenses with filters ───────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 100, page = 1 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate + "T23:59:59");
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET single expense by ID ─────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST create new expense ──────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { category, description, amount, date, notes } = req.body;

    if (!category || !description || !amount)
      return res.status(400).json({ success: false, message: "Category, description, and amount are required" });

    const expense = await Expense.create({ category, description, amount, date: date ? new Date(date) : Date.now(), notes });
    res.status(201).json({ success: true, data: expense, message: "Expense added successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT update expense ───────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { category, description, amount, date, notes } = req.body;

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { category, description, amount, date, notes },
      { new: true, runValidators: true }
    );

    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found" });

    res.json({ success: true, data: expense, message: "Expense updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE expense ────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
