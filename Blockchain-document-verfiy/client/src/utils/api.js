import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  // No default Content-Type — axios sets application/json for plain objects
  // and multipart/form-data (with correct boundary) for FormData automatically.
});

// Restore token on page load
const token = localStorage.getItem('token');
if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const getUsers = () => API.get('/auth/users');
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);

// Documents
export const getAllDocuments = (params) => API.get('/documents', { params });
export const getDocument = (id) => API.get(`/documents/${id}`);
export const createDocument = (data) => API.post('/documents', data);
export const updateDocument = (id, data) => API.put(`/documents/${id}`, data);
export const reviewDocument = (id, action, note) => API.put(`/documents/${id}/review`, { action, note });
export const deleteDocument = (id) => API.delete(`/documents/${id}`);

// Verification (public)
export const verifyByHash = (verificationHash) => API.post('/documents/verify/hash', { verificationHash });
export const verifyById = (documentId) => API.post('/documents/verify/id', { documentId });

// Stats
export const getStats = () => API.get('/documents/stats/overview');

export default API;
