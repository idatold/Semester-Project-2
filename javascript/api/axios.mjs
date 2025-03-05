import axios from 'axios';

// 1. Base URL for your API
const API_BASE_URL = 'https://v2.api.noroff.dev';

// 2. Access your API key from Vite environment variables
const API_KEY = import.meta.env.VITE_API_KEY; // Must not be undefined

// 3. Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Noroff-API-Key': API_KEY, 
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
