// File: /javascript/auth/auth.mjs
import api from '../api/axios.mjs';
import { storeAccessToken } from './accessToken.mjs';

/**
 * Register User
 */
export async function registerUser(username, email, password) {
  try {
    const response = await api.post('/auth/register', {
      name: username, 
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error);
    throw error;
  }
}

/**
 * Login User
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data; // shape: { data: { accessToken, ... }, meta: {} }
  } catch (error) {
    console.error('Login failed:', error.response?.data || error);
    throw error;
  }
};

/**
 * Handle Login
 */
export async function handleLogin(credentials, setUserCallback) {
  try {
    const response = await loginUser(credentials);
    // 'response' shape: { data: { accessToken: '...', name: '...' }, meta: {} }
    const data = response.data; // e.g. { accessToken, name, ... }

    // 1) Store the token
    if (data.accessToken) {
      storeAccessToken(data.accessToken);
    }

    // 2) Save a user object  in localStorage
    const userObject = {
      data: {
        name: data.name,
        accessToken: data.accessToken
      },
      meta: response.meta || {}
    };
    localStorage.setItem('user', JSON.stringify(userObject));

    // 3) Update UI state
    if (setUserCallback) {
      setUserCallback(data);
    }

    return data;
  } catch (error) {
    console.error('Error logging in:', error.response?.data || error);
    throw error;
  }
}
