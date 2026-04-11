import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

// ─── Budget API ────────────────────────────────────────────────────────────────
export const budgetAPI = {
  getAll:       ()               => api.get("/budgets"),
  getOne:       (category)       => api.get(`/budgets/${category}`),
  update:       (category, data) => api.put(`/budgets/${category}`, data),
  bulkUpdate:   (budgets)        => api.put("/budgets", { budgets }),
};

// ─── Expense API ───────────────────────────────────────────────────────────────
export const expenseAPI = {
  getAll:   (params) => api.get("/expenses", { params }),
  getOne:   (id)     => api.get(`/expenses/${id}`),
  create:   (data)   => api.post("/expenses", data),
  update:   (id, data) => api.put(`/expenses/${id}`, data),
  delete:   (id)     => api.delete(`/expenses/${id}`),
};

// ─── Stats API ─────────────────────────────────────────────────────────────────
export const statsAPI = {
  getSummary:    () => api.get("/stats/summary"),
  getTrends:     () => api.get("/stats/trends"),
  getCategories: () => api.get("/stats/categories"),
};

export default api;
