import axios from 'axios';

const api = axios.create({
  // In dev, Vite proxies /api → localhost:8000
  // In prod, point to the real backend
  baseURL: '/api',
  timeout: 300000, // Increased to 5 mins to prevent OCR timeout on CPU
  headers: { 'Accept': 'application/json' },
});

export default api;
