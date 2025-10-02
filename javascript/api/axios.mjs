// javascript/api/axios.mjs
import axios from 'axios';

const API_BASE_URL = 'https://v2.api.noroff.dev';
const API_KEY = import.meta.env.VITE_API_KEY; // may be undefined locally

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  if (API_KEY) {
    config.headers['X-Noroff-API-Key'] = API_KEY;
  }

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
