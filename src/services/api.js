// client/src/services/api.js
import axios from 'axios';

const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return 'https://vvm-backend-46u9.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
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
