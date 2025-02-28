// File: /javascript/mainProfile.mjs
import './main.mjs';
import { updateProfile } from './api/profile.mjs';

document.addEventListener('DOMContentLoaded', () => {
  // Retrieve the stored user object from localStorage
  const userString = localStorage.getItem('user');
  if (!userString) {
    console.error('No logged in user found in localStorage.');
    return;
  }

  // Parse
  const userObj = JSON.parse(userString);
  // userObj shape: { data: { name: 'QueenBee', ... }, meta: {} }
  if (!userObj || !userObj.data || !userObj.data.name) {
    console.error('User data is not in the expected format.');
    return;
  }

  // Use EXACT username from userObj, e.g. "QueenBee"
  const username = userObj.data.name; // <-- No .toLowerCase()
  console.log('Using stored username (exact):', username);

  // Now fetch & update the profile
  updateProfile(username);
});
