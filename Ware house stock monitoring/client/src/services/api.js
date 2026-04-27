import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Warehouses
export const warehousesAPI = {
  getAll: (params) => api.get('/warehouses', { params }),
  getOne: (id) => api.get(`/warehouses/${id}`),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

// Zones
export const zonesAPI = {
  getAll: (params) => api.get('/zones', { params }),
  getOne: (id) => api.get(`/zones/${id}`),
  create: (data) => api.post('/zones', data),
  update: (id, data) => api.put(`/zones/${id}`, data),
  delete: (id) => api.delete(`/zones/${id}`),
};

// Categories
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getOne: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Suppliers
export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getOne: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Products
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Inventory
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getOne: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

// Transactions
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
};

// Alerts
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getOne: (id) => api.get(`/alerts/${id}`),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  markAllAsRead: () => api.put('/alerts/read-all'),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
  delete: (id) => api.delete(`/alerts/${id}`),
  getStats: () => api.get('/alerts/stats'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getMovementChart: (params) => api.get('/dashboard/movement-chart', { params }),
  getTopConsumed: () => api.get('/dashboard/top-consumed'),
  getWarehouseSummary: () => api.get('/dashboard/warehouse-summary'),
  getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
  getRecentActivity: (params) => api.get('/dashboard/recent-activity', { params }),
  getReorderSuggestions: () => api.get('/dashboard/reorder-suggestions'),
  getAging: () => api.get('/dashboard/aging'),
};

// Reports
export const reportsAPI = {
  currentStock: (params) => api.get('/reports/current-stock', { params }),
  stockMovement: (params) => api.get('/reports/stock-movement', { params }),
  warehouseUtilization: () => api.get('/reports/warehouse-utilization'),
  inventoryAging: () => api.get('/reports/inventory-aging'),
  reorder: () => api.get('/reports/reorder'),
  expiry: (params) => api.get('/reports/expiry', { params }),
  supplierInventory: () => api.get('/reports/supplier-inventory'),
  categoryStock: () => api.get('/reports/category-stock'),
  valuation: (params) => api.get('/reports/valuation', { params }),
};

// Audit
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
  getOne: (id) => api.get(`/audit/${id}`),
  getTrail: (entity, entityId) => api.get(`/audit/trail/${entity}/${entityId}`),
};

export default api;
