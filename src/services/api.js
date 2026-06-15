// client/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// ── Products ──────────────────────────────────────────────────────────────────
export const fetchProducts = (params = {}) =>
  API.get('/products', { params }).then(r => r.data);

export const fetchProduct = (id) =>
  API.get(`/products/${id}`).then(r => r.data);

export const fetchFeaturedProducts = () =>
  API.get('/products', { params: { featured: true } }).then(r => r.data);

// ── Enquiries ─────────────────────────────────────────────────────────────────
export const submitEnquiry = (data) =>
  API.post('/enquiries', data).then(r => r.data);

// ── Health ────────────────────────────────────────────────────────────────────
export const healthCheck = () =>
  API.get('/health').then(r => r.data);

export default API;
