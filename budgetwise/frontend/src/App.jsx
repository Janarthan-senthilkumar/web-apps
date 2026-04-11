import { useState, useEffect, useCallback } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Budgets   from "./pages/Budgets.jsx";
import Expenses  from "./pages/Expenses.jsx";
import Reports   from "./pages/Reports.jsx";
import { statsAPI } from "./utils/api.js";
import { Toast }    from "./components/Shared.jsx";

export default function App() {
  const location = useLocation();
  const [toast, setToast]   = useState(null);
  const [summary, setSummary] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await statsAPI.getSummary();
      setSummary(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchSummary(); }, [location.pathname, fetchSummary]);

  return (
    <>
      <style>{`
        .nav { background: linear-gradient(90deg,#ffffff,#f8fafc); border-bottom: 1px solid #cbd5e1; padding: 0 32px; display: flex; align-items: center; position: sticky; top: 0; z-index: 100; }
        .nav-brand { display: flex; align-items: center; gap: 12px; padding: 18px 0; margin-right: 40px; text-decoration: none; }
        .nav-logo  { width: 38px; height: 38px; background: linear-gradient(135deg,#f59e0b,#d97706); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .nav-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #0f172a; letter-spacing: -0.5px; }
        .nav-title span { color: #f59e0b; }
        .nav-tabs  { display: flex; gap: 2px; }
        .nav-tab   { padding: 20px 22px; background: none; border: none; border-bottom: 2px solid transparent; color: #475569; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: color 0.2s, border-color 0.2s; white-space: nowrap; }
        .nav-tab:hover  { color: #0f172a; }
        .nav-tab.active { color: #f59e0b; border-bottom-color: #f59e0b; }
        .nav-badge { background: #ef4444; color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
        .content   { flex: 1; padding: 32px; max-width: 1400px; width: 100%; margin: 0 auto; }
      `}</style>

      <nav className="nav">
        <NavLink to="/" className="nav-brand">
          <div className="nav-logo">💰</div>
          <div className="nav-title">Budget<span>Wise</span></div>
        </NavLink>

        <div className="nav-tabs">
          <NavLink to="/"         end className={({ isActive }) => "nav-tab" + (isActive ? " active" : "")}>📊 Dashboard</NavLink>
          <NavLink to="/budgets"      className={({ isActive }) => "nav-tab" + (isActive ? " active" : "")}>🎯 Budgets</NavLink>
          <NavLink to="/expenses"     className={({ isActive }) => "nav-tab" + (isActive ? " active" : "")}>
            💸 Expenses
            {summary?.overBudgetCount > 0 && <span className="nav-badge">{summary.overBudgetCount}</span>}
          </NavLink>
          <NavLink to="/reports"      className={({ isActive }) => "nav-tab" + (isActive ? " active" : "")}>📈 Reports</NavLink>
        </div>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/"         element={<Dashboard showToast={showToast} onDataChange={fetchSummary} />} />
          <Route path="/budgets"  element={<Budgets   showToast={showToast} onDataChange={fetchSummary} />} />
          <Route path="/expenses" element={<Expenses  showToast={showToast} onDataChange={fetchSummary} />} />
          <Route path="/reports"  element={<Reports   showToast={showToast} />} />
        </Routes>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
