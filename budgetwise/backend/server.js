const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (dev only) ────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/budgets",  require("./routes/budgets"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/stats",    require("./routes/stats"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", message: "BudgetWise API is running", timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Connect to MongoDB & Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected:", process.env.MONGO_URI);
    await seedDatabase();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ─── Seed Initial Data ────────────────────────────────────────────────────────
async function seedDatabase() {
  const Budget  = require("./models/Budget");
  const Expense = require("./models/Expense");

  const budgetCount  = await Budget.countDocuments();
  const expenseCount = await Expense.countDocuments();

  if (budgetCount === 0) {
    const defaultBudgets = [
      { category: "housing",   label: "Housing",      icon: "🏠", color: "#f59e0b", monthlyLimit: 15000 },
      { category: "food",      label: "Food & Dining", icon: "🍽️", color: "#10b981", monthlyLimit: 8000  },
      { category: "transport", label: "Transport",     icon: "🚗", color: "#3b82f6", monthlyLimit: 4000  },
      { category: "health",    label: "Health",        icon: "💊", color: "#ec4899", monthlyLimit: 3000  },
      { category: "education", label: "Education",     icon: "📚", color: "#8b5cf6", monthlyLimit: 5000  },
      { category: "shopping",  label: "Shopping",      icon: "🛍️", color: "#f97316", monthlyLimit: 6000  },
      { category: "utilities", label: "Utilities",     icon: "⚡", color: "#06b6d4", monthlyLimit: 2500  },
      { category: "leisure",   label: "Leisure",       icon: "🎮", color: "#a3e635", monthlyLimit: 3500  },
    ];
    await Budget.insertMany(defaultBudgets);
    console.log("🌱 Seeded default budgets");
  }

  if (expenseCount === 0) {
    const defaultExpenses = [
      { category: "housing",   description: "Monthly Rent",      amount: 12000, date: new Date("2025-03-01") },
      { category: "food",      description: "Grocery Store",     amount: 2200,  date: new Date("2025-03-03") },
      { category: "transport", description: "Fuel",              amount: 1800,  date: new Date("2025-03-05") },
      { category: "food",      description: "Restaurant Dinner", amount: 1500,  date: new Date("2025-03-08") },
      { category: "health",    description: "Gym Membership",    amount: 1200,  date: new Date("2025-03-10") },
      { category: "shopping",  description: "Clothing",          amount: 3500,  date: new Date("2025-03-12") },
      { category: "utilities", description: "Electricity Bill",  amount: 1100,  date: new Date("2025-03-14") },
      { category: "education", description: "Online Course",     amount: 2000,  date: new Date("2025-03-15") },
      { category: "leisure",   description: "Movie & Outing",    amount: 900,   date: new Date("2025-03-18") },
      { category: "food",      description: "Weekly Groceries",  amount: 1800,  date: new Date("2025-03-20") },
      { category: "transport", description: "Uber Rides",        amount: 650,   date: new Date("2025-03-22") },
      { category: "shopping",  description: "Electronics",       amount: 4200,  date: new Date("2025-03-25") },
    ];
    await Expense.insertMany(defaultExpenses);
    console.log("🌱 Seeded default expenses");
  }
}
