import axios from 'axios';

const api = axios.create({
  // In dev, Vite proxies /api → localhost:8000
  // In prod, point to the real backend
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Accept': 'application/json' },
});

export default api;
