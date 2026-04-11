import styles from "./Shared.module.css";

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, pill, pillType = "up", icon, accent }) {
  return (
    <div className={`${styles.statCard} ${styles[accent] || ""}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statSub}>
        {pill && <span className={`${styles.pill} ${styles[pillType]}`}>{pill}</span>}
        {sub}
      </div>
      {icon && <div className={styles.statIcon}>{icon}</div>}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color, height = 6 }) {
  const p = Math.min(100, Math.round(((value || 0) / (max || 1)) * 100));
  const barColor = p >= 100 ? "#ef4444" : p > 80 ? "#f59e0b" : color || "#10b981";
  return (
    <div style={{ height, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: p + "%", background: barColor, borderRadius: 3, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #cbd5e1", borderTop: "3px solid #f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <span style={{ fontSize: 20 }}>⚠️</span>
      <span style={{ fontSize: 13, color: "#b91c1c", flex: 1 }}>{message}</span>
      {onRetry && <button onClick={onRetry} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#b91c1c", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Retry</button>}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success" }) {
  if (!message) return null;
  const bg = type === "success" ? "#10b981" : "#ef4444";
  return (
    <div style={{ position: "fixed", bottom: 32, right: 32, background: bg, color: "white", padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 9999, animation: "slideUp 0.3s ease", boxShadow: `0 8px 32px ${bg}55` }}>
      {message}
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

// ─── Custom Recharts Tooltip ─────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 14px", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontSize: 13, margin: "2px 0" }}>
          {p.name}: <strong>₹{Number(p.value).toLocaleString("en-IN")}</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────
export function CatBadge({ category }) {
  const CATEGORY_MAP = {
    housing:   { label: "Housing",      icon: "🏠", color: "#f59e0b" },
    food:      { label: "Food & Dining", icon: "🍽️", color: "#10b981" },
    transport: { label: "Transport",     icon: "🚗", color: "#3b82f6" },
    health:    { label: "Health",        icon: "💊", color: "#ec4899" },
    education: { label: "Education",     icon: "📚", color: "#8b5cf6" },
    shopping:  { label: "Shopping",      icon: "🛍️", color: "#f97316" },
    utilities: { label: "Utilities",     icon: "⚡", color: "#06b6d4" },
    leisure:   { label: "Leisure",       icon: "🎮", color: "#a3e635" },
  };
  const cat = CATEGORY_MAP[category] || { label: category, icon: "💰", color: "#475569" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: cat.color + "22", color: cat.color }}>
      {cat.icon} {cat.label}
    </span>
  );
}
