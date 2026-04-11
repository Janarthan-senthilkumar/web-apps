const express = require("express");
const router  = express.Router();
const Expense = require("../models/Expense");
const Budget  = require("../models/Budget");

// ─── GET dashboard summary stats ──────────────────────────────────────────────
router.get("/summary", async (req, res) => {
  try {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [budgets, monthlyExpenses] = await Promise.all([
      Budget.find(),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: "$category", spent: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
    ]);

    const spendMap = {};
    monthlyExpenses.forEach((e) => (spendMap[e._id] = { spent: e.spent, count: e.count }));

    const totalBudget  = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent   = monthlyExpenses.reduce((sum, e) => sum + e.spent, 0);
    const totalSavings = totalBudget - totalSpent;
    const overBudget   = budgets.filter((b) => (spendMap[b.category]?.spent || 0) > b.monthlyLimit);

    res.json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        totalSavings,
        savingsRate:       Math.round((totalSavings / totalBudget) * 100),
        budgetUtilization: Math.round((totalSpent   / totalBudget) * 100),
        overBudgetCount:   overBudget.length,
        overBudgetCategories: overBudget.map((b) => b.category),
        totalTransactions: monthlyExpenses.reduce((sum, e) => sum + e.count, 0),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET 6-month trend data ───────────────────────────────────────────────────
router.get("/trends", async (req, res) => {
  try {
    const now    = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      months.push({ start, end, label: d.toLocaleString("default", { month: "short" }) });
    }

    const trendData = await Promise.all(
      months.map(async ({ start, end, label }) => {
        const [expenses, budgets] = await Promise.all([
          Expense.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          Budget.aggregate([{ $group: { _id: null, total: { $sum: "$monthlyLimit" } } }]),
        ]);

        const totalExpenses = expenses[0]?.total || 0;
        const totalBudget   = budgets[0]?.total  || 0;

        return {
          month:    label,
          income:   totalBudget,
          expenses: totalExpenses,
          savings:  totalBudget - totalExpenses,
        };
      })
    );

    res.json({ success: true, data: trendData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET category breakdown for current month ─────────────────────────────────
router.get("/categories", async (req, res) => {
  try {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [breakdown, budgets] = await Promise.all([
      Expense.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Budget.find(),
    ]);

    const budgetMap = {};
    budgets.forEach((b) => (budgetMap[b.category] = b));

    const result = breakdown.map((item) => ({
      category: item._id,
      spent:    item.total,
      count:    item.count,
      limit:    budgetMap[item._id]?.monthlyLimit || 0,
      label:    budgetMap[item._id]?.label        || item._id,
      icon:     budgetMap[item._id]?.icon         || "💰",
      color:    budgetMap[item._id]?.color        || "#f59e0b",
      utilization: Math.round((item.total / (budgetMap[item._id]?.monthlyLimit || 1)) * 100),
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
