// auth.mjs
import api from '../api/axios.mjs';

export async function registerUser(username, email, password) {
  try {
    const response = await api.post('/auth/register', {
      name: username,   // The API expects "name" for the username field
      email: email,
      password: password,
    });
    return response.data; 
  } catch (error) {
    console.error('Registration error:', error);
    // You might want to handle error messages for the user here
    throw error;
  }
}


/**
 * Login User
 */
export async function loginUser(email, password) {
  try {
    // If your API expects "email" for login:
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
