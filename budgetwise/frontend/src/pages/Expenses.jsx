import { useState, useEffect, useCallback } from "react";
import { expenseAPI } from "../utils/api.js";
import { fmt, fmtDate, CATEGORIES } from "../utils/helpers.js";
import { StatCard, Spinner, ErrorBanner, CatBadge } from "../components/Shared.jsx";

const EMPTY_FORM = {
  category: "food",
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function Expenses({ showToast, onDataChange }) {
  const [expenses,   setExpenses]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, obj = edit
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [filter,     setFilter]     = useState({ category: "", startDate: "", endDate: "" });
  const [confirm,    setConfirm]    = useState(null); // id to delete

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (filter.category)  params.category  = filter.category;
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate)   params.endDate   = filter.endDate;
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setShowModal(true); };
  const openEdit = (exp) => {
    setForm({ category: exp.category, description: exp.description, amount: exp.amount, date: exp.date?.slice(0, 10) || "", notes: exp.notes || "" });
    setEditTarget(exp);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.description.trim() || !form.amount || +form.amount <= 0) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await expenseAPI.update(editTarget._id, { ...form, amount: +form.amount });
        showToast("Expense updated successfully!");
      } else {
        await expenseAPI.create({ ...form, amount: +form.amount });
        showToast("Expense added successfully!");
      }
      setShowModal(false);
      await load();
      onDataChange();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseAPI.delete(id);
      showToast("Expense deleted", "error");
      setConfirm(null);
      await load();
      onDataChange();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const avgAmount  = expenses.length ? Math.round(totalSpent / expenses.length) : 0;

  if (loading) return <Spinner />;
  if (error)   return <ErrorBanner message={error} onRetry={load} />;

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:"#0f172a" }}>
          Expense <span style={{ color:"#f59e0b" }}>Tracker</span>
        </h1>
        <button onClick={openAdd} style={btnPrimary}>+ Add Expense</button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:28 }}>
        <StatCard label="Total Transactions" value={expenses.length}  sub="Recorded expenses"     icon="ðŸ§¾" accent="gold"  />
        <StatCard label="Total Spent"        value={fmt(totalSpent)}  sub="Across all categories" icon="ðŸ’¸" accent="green" />
        <StatCard label="Avg Transaction"    value={fmt(avgAmount)}   sub="Per expense"            icon="ðŸ“Š" accent="blue"  />
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:20, background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:12, padding:"14px 18px", alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#475569" }}>ðŸ” Filter</span>
        <select style={{ ...formInput, width:180 }} value={filter.category} onChange={(e) => setFilter((p) => ({ ...p, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <input type="date" style={{ ...formInput, width:160 }} value={filter.startDate} onChange={(e) => setFilter((p) => ({ ...p, startDate: e.target.value }))} />
        <span style={{ color:"#475569", fontSize:13 }}>to</span>
        <input type="date" style={{ ...formInput, width:160 }} value={filter.endDate} onChange={(e) => setFilter((p) => ({ ...p, endDate: e.target.value }))} />
        {(filter.category || filter.startDate || filter.endDate) && (
          <button style={btnGhost} onClick={() => setFilter({ category:"", startDate:"", endDate:"" })}>âœ• Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{ background:"linear-gradient(135deg,#ffffff,#f8fafc)", border:"1px solid #cbd5e1", borderRadius:16, overflow:"hidden" }}>
        {expenses.length === 0 ? (
          <div style={{ padding:"60px 0", textAlign:"center", color:"#475569" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>ðŸ§¾</div>
            <p style={{ fontSize:16, marginBottom:6 }}>No expenses found</p>
            <p style={{ fontSize:13 }}>Add your first expense to get started</p>
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["#", "Description", "Category", "Date", "Amount", "Actions"].map((h) => (
                  <th key={h} style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:"#475569", padding:"14px 16px", textAlign:"left", borderBottom:"1px solid #cbd5e1" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr key={e._id} style={{ borderBottom:"1px solid #e2e8f0" }}
                  onMouseEnter={(ev) => ev.currentTarget.style.background = "rgba(148,163,184,0.16)"}
                  onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}>
                  <td style={{ padding:"14px 16px", color:"#475569", fontFamily:"'DM Mono',monospace", fontSize:12 }}>{String(i+1).padStart(2,"0")}</td>
                  <td style={{ padding:"14px 16px", color:"#1e293b", fontSize:14 }}>
                    {e.description}
                    {e.notes && <span style={{ display:"block", fontSize:11, color:"#475569", marginTop:2 }}>{e.notes}</span>}
                  </td>
                  <td style={{ padding:"14px 16px" }}><CatBadge category={e.category} /></td>
                  <td style={{ padding:"14px 16px", color:"#64748b", fontSize:13 }}>{fmtDate(e.date)}</td>
                  <td style={{ padding:"14px 16px", fontFamily:"'DM Mono',monospace", fontSize:15, color:"#0f172a" }}>{fmt(e.amount)}</td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => openEdit(e)} style={iconBtn} title="Edit">âœï¸</button>
                      <button onClick={() => setConfirm(e._id)} style={{ ...iconBtn, color:"#ef4444" }} title="Delete">ðŸ—‘</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={modalStyle}>
            <h2 style={modalTitle}>{editTarget ? "Edit Expense" : "Add New Expense"}</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={lbl}>Category</label>
                <select style={formInput} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Description *</label>
                <input style={formInput} placeholder="e.g. Monthly Rent" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lbl}>Amount (â‚¹) *</label>
                  <input type="number" style={formInput} placeholder="0" min="0" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Date</label>
                  <input type="date" style={formInput} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={lbl}>Notes (optional)</label>
                <input style={formInput} placeholder="Additional details..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display:"flex", gap:12, marginTop:28 }}>
              <button style={{ ...btnPrimary, flex:1, justifyContent:"center", opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editTarget ? "ðŸ’¾ Update Expense" : "âœ… Add Expense"}
              </button>
              <button style={btnGhost} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setConfirm(null)}>
          <div style={{ ...modalStyle, width:380, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>ðŸ—‘ï¸</div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:"#0f172a", marginBottom:10 }}>Delete Expense?</h2>
            <p style={{ fontSize:14, color:"#64748b", marginBottom:28 }}>This action cannot be undone.</p>
            <div style={{ display:"flex", gap:12 }}>
              <button style={{ ...btnPrimary, flex:1, justifyContent:"center", background:"linear-gradient(135deg,#ef4444,#dc2626)" }} onClick={() => handleDelete(confirm)}>Delete</button>
              <button style={{ ...btnGhost, flex:1, justifyContent:"center" }} onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary  = { display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",border:"none" };
const btnGhost    = { display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:"rgba(148,163,184,0.22)",color:"#334155",fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",border:"1px solid #cbd5e1" };
const iconBtn     = { background:"none",border:"none",fontSize:15,cursor:"pointer",padding:"4px 8px",borderRadius:6,opacity:0.7 };
const overlayStyle= { position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" };
const modalStyle  = { background:"#ffffff",border:"1px solid #cbd5e1",borderRadius:20,padding:36,width:480,maxWidth:"95vw" };
const modalTitle  = { fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#0f172a",marginBottom:24 };
const formInput   = { width:"100%",padding:"11px 14px",background:"#f8fafc",border:"1px solid #cbd5e1",borderRadius:10,color:"#0f172a",fontFamily:"'Outfit',sans-serif",fontSize:14,outline:"none" };
const lbl         = { display:"block",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#475569",marginBottom:8 };


