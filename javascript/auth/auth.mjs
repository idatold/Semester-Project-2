import api from '../api/axios.mjs';
import { storeAccessToken } from './accessToken.mjs';

/**
 * Register User
 */
export async function registerUser(username, email, password) {
  try {
    const response = await api.post('/auth/register', {
      name: username, // The API expects "name" for the username field
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login User
 */
export async function loginUser(email, password) {
  try {
    // 1) POST /auth/login
    const response = await api.post('/auth/login', { email, password });

    // 2) Log the entire response so you see what the server returns
    console.log('Login full response:', response.data);

    // The Auction API might return something like:
    // { data: { accessToken: "...", name: "User", ... }, meta: {} }
    // Or maybe { data: { token: "..." }, ... }

    // 3) Destructure from response.data.data if that's the shape
    const maybeData = response.data.data || {}; // fallback to empty obj
    console.log('Login response data (inner):', maybeData);

    // 4) Attempt to grab either "accessToken" or "token"
    const { accessToken, token } = maybeData;

    // 5) If we find one of them, store it
    if (accessToken) {
      storeAccessToken(accessToken);
      console.log('Access token stored from "accessToken":', accessToken);
    } else if (token) {
      storeAccessToken(token);
      console.log('Access token stored from "token":', token);
    } else {
      console.warn('No token found in login response. Check the API structure.');
    }

    // 6) Return the entire response if needed
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
