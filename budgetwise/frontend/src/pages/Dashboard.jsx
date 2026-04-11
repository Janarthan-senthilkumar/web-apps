import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { statsAPI, budgetAPI } from "../utils/api.js";
import { fmt, pct, CATEGORIES } from "../utils/helpers.js";
import { StatCard, ProgressBar, Spinner, ErrorBanner, ChartTooltip } from "../components/Shared.jsx";

export default function Dashboard({ showToast, onDataChange }) {
  const [summary,  setSummary]  = useState(null);
  const [trends,   setTrends]   = useState([]);
  const [budgets,  setBudgets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [sumRes, trendRes, budgetRes] = await Promise.all([
        statsAPI.getSummary(),
        statsAPI.getTrends(),
        budgetAPI.getAll(),
      ]);
      setSummary(sumRes.data);
      setTrends(trendRes.data);
      setBudgets(budgetRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pieData = budgets
    .filter((b) => b.spent > 0)
    .map((b) => {
      const cat = CATEGORIES.find((c) => c.id === b.category);
      return { name: b.label, value: b.spent, color: cat?.color || "#f59e0b" };
    });

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner message={error} onRetry={load} />;

  const overBudget = budgets.filter((b) => b.spent > b.monthlyLimit);

  return (
    <div>
      {overBudget.length > 0 && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>âš ï¸</span>
          <span style={{ fontSize: 13, color: "#b91c1c" }}>
            <strong>Budget Alert:</strong> You've exceeded limits in {overBudget.map((b) => b.label).join(", ")}.
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 }}>
        <StatCard label="Total Budget"  value={fmt(summary?.totalBudget)}  sub="Monthly allocation"      icon="ðŸ“Š" accent="gold"  />
        <StatCard label="Total Spent"   value={fmt(summary?.totalSpent)}   sub="of budget used"         pill={summary?.budgetUtilization + "%"} pillType="up"  icon="ðŸ’¸" accent="green" />
        <StatCard label="Remaining"     value={fmt(summary?.totalSavings)} sub="available to spend"     pill={(100 - (summary?.budgetUtilization || 0)) + "%"} pillType="up" icon="ðŸ¦" accent="blue" />
        <StatCard label="Over Budget"   value={summary?.overBudgetCount || 0} sub={overBudget.length ? "Categories at risk" : "All clear âœ“"} icon="ðŸš¨" accent="red" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }}>
        <div style={{ background: "linear-gradient(135deg,#ffffff,#f8fafc)", border: "1px solid #cbd5e1", borderRadius: 16, padding: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#64748b", marginBottom: 24 }}>6-Month Financial Trend</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                <linearGradient id="gSav" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => "â‚¹" + (v/1000) + "k"} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
              <Area type="monotone" dataKey="income"   name="Income"   stroke="#f59e0b" fill="url(#gInc)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#gExp)" strokeWidth={2} />
              <Area type="monotone" dataKey="savings"  name="Savings"  stroke="#10b981" fill="url(#gSav)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "linear-gradient(135deg,#ffffff,#f8fafc)", border: "1px solid #cbd5e1", borderRadius: 16, padding: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#64748b", marginBottom: 24 }}>Spend by Category</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Progress */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#0f172a" }}>Category <span style={{ color: "#f59e0b" }}>Performance</span></h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {budgets.map((b) => {
          const cat  = CATEGORIES.find((c) => c.id === b.category);
          const over = b.spent > b.monthlyLimit;
          return (
            <div key={b.category} style={{ background: "#ffffff", border: `1px solid ${over ? "rgba(239,68,68,0.4)" : "#cbd5e1"}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{cat?.icon} {b.label}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: "#0f172a" }}>{fmt(b.spent)}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>of {fmt(b.monthlyLimit)}</div>
                </div>
              </div>
              <ProgressBar value={b.spent} max={b.monthlyLimit} color={cat?.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: over ? "#ef4444" : "#64748b" }}>
                  {over ? `âš  Exceeded by ${fmt(b.spent - b.monthlyLimit)}` : `${b.utilization}% used`}
                </span>
                {!over && <span style={{ fontSize: 12, color: "#10b981" }}>{fmt(b.remaining)} left</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


