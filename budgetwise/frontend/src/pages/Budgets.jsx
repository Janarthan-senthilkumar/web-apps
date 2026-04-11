import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { budgetAPI } from "../utils/api.js";
import { fmt, pct, CATEGORIES } from "../utils/helpers.js";
import { StatCard, ProgressBar, Spinner, ErrorBanner, ChartTooltip } from "../components/Shared.jsx";

export default function Budgets({ showToast, onDataChange }) {
  const [budgets,     setBudgets]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [editInputs,  setEditInputs]  = useState({});
  const [saving,      setSaving]      = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await budgetAPI.getAll();
      setBudgets(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = () => {
    const inputs = {};
    budgets.forEach((b) => (inputs[b.category] = b.monthlyLimit));
    setEditInputs(inputs);
    setShowModal(true);
  };

  const saveBudgets = async () => {
    const updates = {};
    budgets.forEach((b) => {
      const val = Number(editInputs[b.category]);
      if (val > 0 && val !== b.monthlyLimit) updates[b.category] = val;
    });

    if (Object.keys(updates).length === 0) {
      showToast("No changes to save", "error");
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        Object.entries(updates).map(([category, monthlyLimit]) =>
          budgetAPI.update(category, { monthlyLimit })
        )
      );
      showToast("Budgets updated successfully!");
      setShowModal(false);
      await load();
      onDataChange();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const totalBudget  = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent   = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const totalSavings = totalBudget - totalSpent;
  const overBudget   = budgets.filter((b) => (b.spent || 0) > b.monthlyLimit);

  const chartData = budgets.map((b) => {
    const cat = CATEGORIES.find((c) => c.id === b.category);
    return { name: b.label.split("&")[0].trim(), budget: b.monthlyLimit, spent: b.spent || 0, color: cat?.color };
  });

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner message={error} onRetry={load} />;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#0f172a" }}>
          Manage <span style={{ color: "#f59e0b" }}>Budgets</span>
        </h1>
        <button onClick={openModal} style={btnPrimary}>âœï¸ Edit All Budgets</button>
      </div>

      {/* Summary Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, background: "linear-gradient(90deg,rgba(245,158,11,0.08),transparent)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "16px 24px", marginBottom: 28 }}>
        {[
          { label: "Total Budget", value: fmt(totalBudget), color: "#0f172a" },
          { label: "Total Spent",  value: fmt(totalSpent),  color: "#ef4444" },
          { label: "Remaining",    value: fmt(totalSavings > 0 ? totalSavings : 0), color: "#10b981" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#64748b" }}>{item.label}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: item.color }}>{item.value}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 36, background: "rgba(245,158,11,0.2)", margin: "0 4px" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
            <span>Budget Health</span>
            <span>{pct(totalSpent, totalBudget)}% Utilized</span>
          </div>
          <div style={{ height: 8, background: "#cbd5e1", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pct(totalSpent, totalBudget) + "%", background: "linear-gradient(90deg,#10b981,#f59e0b,#ef4444)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ background: "linear-gradient(135deg,#ffffff,#f8fafc)", border: "1px solid #cbd5e1", borderRadius: 16, padding: 28, marginBottom: 28 }}>
        <p style={chartTitle}>Budget vs Actual Spend per Category</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => "â‚¹" + v / 1000 + "k"} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
            <Bar dataKey="budget" name="Budget" fill="#cbd5e1" radius={[4,4,0,0]} />
            <Bar dataKey="spent"  name="Spent"  fill="#f59e0b" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {budgets.map((b) => {
          const cat  = CATEGORIES.find((c) => c.id === b.category);
          const over = (b.spent || 0) > b.monthlyLimit;
          const nearLimit = !over && pct(b.spent, b.monthlyLimit) > 80;
          return (
            <div key={b.category} style={{ background: "#ffffff", border: `1px solid ${over ? "rgba(239,68,68,0.4)" : "#cbd5e1"}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{cat?.icon} {b.label}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {over      && <span style={{ ...pill, background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>Over Budget</span>}
                  {nearLimit && <span style={{ ...pill, background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>Near Limit</span>}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: "#0f172a" }}>{fmt(b.spent || 0)}</span>
                <span style={{ fontSize: 13, color: "#475569" }}>Budget: {fmt(b.monthlyLimit)}</span>
              </div>
              <ProgressBar value={b.spent || 0} max={b.monthlyLimit} color={cat?.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>{pct(b.spent, b.monthlyLimit)}% used</span>
                <span style={{ fontSize: 12, color: over ? "#ef4444" : "#10b981" }}>
                  {over ? `âˆ’ ${fmt((b.spent || 0) - b.monthlyLimit)}` : `+ ${fmt(b.monthlyLimit - (b.spent || 0))}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ ...modal, width: 600 }}>
            <h2 style={modalTitle}>Edit Monthly Budgets</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
              {budgets.map((b) => {
                const cat = CATEGORIES.find((c) => c.id === b.category);
                return (
                  <div key={b.category} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{cat?.icon} {b.label}</span>
                      <span style={{ color: "#475569" }}>Current: {fmt(b.monthlyLimit)}</span>
                    </label>
                    <input
                      type="number"
                      style={formInput}
                      value={editInputs[b.category] || ""}
                      onChange={(e) => setEditInputs((p) => ({ ...p, [b.category]: e.target.value }))}
                      placeholder={b.monthlyLimit}
                      min={0}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button style={{ ...btnPrimary, flex: 1, justifyContent: "center", opacity: saving ? 0.7 : 1 }} onClick={saveBudgets} disabled={saving}>
                {saving ? "Saving..." : "ðŸ’¾ Save Budgets"}
              </button>
              <button style={btnGhost} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Inline Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const btnPrimary = { display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",border:"none" };
const btnGhost   = { display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:"rgba(148,163,184,0.22)",color:"#334155",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",border:"1px solid #cbd5e1" };
const overlay    = { position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" };
const modal      = { background:"#ffffff",border:"1px solid #cbd5e1",borderRadius:20,padding:36,maxWidth:"95vw" };
const modalTitle = { fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#0f172a",marginBottom:24 };
const formInput  = { width:"100%",padding:"11px 14px",background:"#f8fafc",border:"1px solid #cbd5e1",borderRadius:10,color:"#0f172a",fontFamily:"'Outfit',sans-serif",fontSize:14,outline:"none" };
const chartTitle = { fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#64748b",marginBottom:24 };
const pill       = { padding:"2px 10px",borderRadius:20,fontSize:12,fontWeight:600 };


