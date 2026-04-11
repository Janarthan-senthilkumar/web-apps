// ─── Category Definitions ─────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: "housing",   label: "Housing",      icon: "🏠", color: "#f59e0b" },
  { id: "food",      label: "Food & Dining", icon: "🍽️", color: "#10b981" },
  { id: "transport", label: "Transport",     icon: "🚗", color: "#3b82f6" },
  { id: "health",    label: "Health",        icon: "💊", color: "#ec4899" },
  { id: "education", label: "Education",     icon: "📚", color: "#8b5cf6" },
  { id: "shopping",  label: "Shopping",      icon: "🛍️", color: "#f97316" },
  { id: "utilities", label: "Utilities",     icon: "⚡", color: "#06b6d4" },
  { id: "leisure",   label: "Leisure",       icon: "🎮", color: "#a3e635" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

// ─── Formatters ───────────────────────────────────────────────────────────────
export const fmt   = (n)       => "₹" + Number(n || 0).toLocaleString("en-IN");
export const pct   = (a, b)    => Math.min(100, Math.round(((a || 0) / (b || 1)) * 100));
export const fmtDate = (d)     => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
