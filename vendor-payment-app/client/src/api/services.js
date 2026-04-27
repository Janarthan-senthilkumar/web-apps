import api from './axios';

// ---- AUTH ----
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ---- VENDORS ----
export const vendorAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  getOne: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// ---- INVOICES ----
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getOne: (id) => api.get(`/invoices/${id}`),
  create: (formData) => api.post('/invoices', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/invoices/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/invoices/${id}`),
  submit: (id) => api.patch(`/invoices/${id}/submit`),
  approve: (id, data) => api.patch(`/invoices/${id}/approve`, data),
  reject: (id, data) => api.patch(`/invoices/${id}/reject`, data),
};

// ---- PAYMENTS ----
export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getOne: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

// ---- DASHBOARD ----
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

// ---- REPORTS ----
export const reportAPI = {
  outstanding: (params) => api.get('/reports/outstanding', { params }),
  vendorWise: () => api.get('/reports/vendor-wise'),
  payments: (params) => api.get('/reports/payments', { params }),
};

// ---- USERS ----
export const userAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
