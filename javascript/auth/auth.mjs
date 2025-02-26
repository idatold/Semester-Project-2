// auth.mjs
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


export async function loginUser(email, password) {
  try {
    // 1) Make the POST request to /auth/login
    const response = await api.post('/auth/login', { email, password });

    // 2) Log the response so you can see the exact structure
    console.log('Login response data:', response.data.data);
    // Example: { accessToken: 'abc123', user: {...} } or { token: 'abc123', ... }

    // 3) If your Auction API returns { accessToken: "abc123" }, destructure that:
    const { accessToken, token } = response.data.data;

    // If "accessToken" is there, store it. Otherwise, if "token" is there, store that.
    // Adjust this to match your actual API property name.
    if (accessToken) {
      storeAccessToken(accessToken);
      console.log('Access token stored:', accessToken);
    } else if (token) {
      storeAccessToken(token);
      console.log('Access token stored (from "token"):', token);
    } else {
      console.warn('No token found in the login response. Check the API structure.');
    }

    // 4) Return the entire response data if you want the caller to see it
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
