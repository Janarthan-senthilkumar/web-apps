import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { statsAPI } from "../utils/api.js";
import { fmt, CATEGORIES } from "../utils/helpers.js";
import { Spinner, ErrorBanner, ChartTooltip } from "../components/Shared.jsx";

export default function Reports({ showToast }) {
  const [summary,    setSummary]    = useState(null);
  const [trends,     setTrends]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [sumRes, trendRes, catRes] = await Promise.all([
        statsAPI.getSummary(),
        statsAPI.getTrends(),
        statsAPI.getCategories(),
      ]);
      setSummary(sumRes.data);
      setTrends(trendRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner message={error} onRetry={load} />;

  const pieData = [
    { name: "Spent",  value: summary?.totalSpent   || 0, color: "#ef4444" },
    { name: "Saved",  value: Math.max(0, summary?.totalSavings || 0), color: "#10b981" },
  ];

  const topCat = categories.length > 0
    ? categories.reduce((a, b) => (a.spent > b.spent ? a : b))
    : null;

  const mostEconomical = categories.length > 0
    ? categories.reduce((a, b) => ((a.spent / a.limit) < (b.spent / b.limit) ? a : b))
    : null;

  const metrics = [
    { label: "Savings Rate",        value: `${summary?.savingsRate || 0}%`,            color: "#10b981" },
    { label: "Budget Utilization",  value: `${summary?.budgetUtilization || 0}%`,       color: "#f59e0b" },
    { label: "Total Transactions",  value: summary?.totalTransactions || 0,             color: "#3b82f6" },
    { label: "Avg Daily Spend",     value: fmt(Math.round((summary?.totalSpent || 0) / 30)), color: "#0f172a" },
    { label: "Over Budget Count",   value: summary?.overBudgetCount || 0,               color: summary?.overBudgetCount > 0 ? "#ef4444" : "#10b981" },
    { label: "Highest Spend Cat",   value: topCat?.label || "â€”",                        color: "#f59e0b" },
    { label: "Most Economical",     value: mostEconomical?.label || "â€”",                color: "#10b981" },
    { label: "Total Budget",        value: fmt(summary?.totalBudget),                   color: "#475569" },
  ];

  const recommendations = [
    ...(summary?.overBudgetCategories || []).map((cat) => {
      const catInfo = CATEGORIES.find((c) => c.id === cat);
      const catData = categories.find((c) => c.category === cat);
      return { type: "danger", text: `${catInfo?.icon || "âš "} Reduce ${catInfo?.label || cat} spending â€” over budget by ${fmt((catData?.spent || 0) - (catData?.limit || 0))}` };
    }),
    ...categories.filter((c) => c.utilization < 40).map((c) => ({
      type: "success",
      text: `${c.icon} Great control in ${c.label} â€” ${fmt(c.limit - c.spent)} saved`,
    })),
    {
      type: "info",
      text: `ðŸ“Š You are on track to save ${fmt(Math.max(0, summary?.totalSavings || 0))} this month`,
    },
    {
      type: "info",
      text: `ðŸ’¡ Invest your monthly savings for long-term financial growth`,
    },
  ].slice(0, 8);

  const recColor = { danger: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#b91c1c", accent: "#ef4444" }, success: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", text: "#047857", accent: "#10b981" }, info: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#1d4ed8", accent: "#3b82f6" } };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#0f172a" }}>
          Reports & <span style={{ color: "#f59e0b" }}>Insights</span>
        </h1>
        <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Financial analysis and smart recommendations for this month</p>
      </div>

      {/* Top Chart Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 28 }}>
        <div style={card}>
          <p style={chartTitle}>Monthly Savings vs Expenses</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trends} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => "â‚¹" + v/1000 + "k"} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
              <Bar dataKey="savings"  name="Savings"  fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <p style={chartTitle}>Budget Split This Month</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={4}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income trend line chart */}
      <div style={{ ...card, marginBottom: 28 }}>
        <p style={chartTitle}>Income vs Expense 6-Month Trend</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => "â‚¹" + v/1000 + "k"} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
            <Line type="monotone" dataKey="income"   name="Income"   stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: "#ef4444" }} />
            <Line type="monotone" dataKey="savings"  name="Savings"  stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown Bar */}
      <div style={{ ...card, marginBottom: 28 }}>
        <p style={chartTitle}>Category Utilization (%)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categories.map((c) => {
            const cat   = CATEGORIES.find((x) => x.id === c.category);
            const over  = c.utilization >= 100;
            const color = over ? "#ef4444" : c.utilization > 80 ? "#f59e0b" : cat?.color || "#10b981";
            return (
              <div key={c.category} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 130, fontSize: 13, color: "#475569", flexShrink: 0 }}>{c.icon} {c.label}</span>
                <div style={{ flex: 1, height: 10, background: "#cbd5e1", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(100, c.utilization) + "%", background: color, borderRadius: 5 }} />
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color, width: 45, textAlign: "right", flexShrink: 0 }}>
                  {c.utilization}%
                </span>
                <span style={{ fontSize: 12, color: "#475569", width: 100, textAlign: "right", flexShrink: 0 }}>
                  {fmt(c.spent)} / {fmt(c.limit)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics + Recommendations */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Key Metrics */}
        <div style={card}>
          <p style={chartTitle}>ðŸ“ˆ Key Metrics</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {metrics.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: "#475569" }}>{m.label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div style={card}>
          <p style={chartTitle}>ðŸ’¡ Smart Recommendations</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recommendations.map((r, i) => {
              const c = recColor[r.type];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: c.bg, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.accent}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: c.text, lineHeight: 1.4 }}>{r.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const card       = { background:"linear-gradient(135deg,#ffffff,#f8fafc)", border:"1px solid #cbd5e1", borderRadius:16, padding:28 };
const chartTitle = { fontSize:12, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"#64748b", marginBottom:24 };


