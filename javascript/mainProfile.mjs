import './main.mjs';
import { updateProfile, updateCredits } from './api/profile.mjs';
import { setupProfileModals } from './utils/profileModals.mjs';
import { initProfileCarousels } from './utils/profileCarousels.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  const userString = localStorage.getItem('user');
  if (!userString) {
    console.error('No logged in user found in localStorage.');
    return;
  }
  const userObj = JSON.parse(userString);
  if (!userObj?.data?.name) {
    console.error('User data is not in the expected format.');
    return;
  }
  const username = userObj.data.name;
  console.log('Using stored username (exact):', username);

  // Update the profile page details (name, avatar, bio, banner, etc.)
  await updateProfile(username);
  // Update credits in all elements (desktop & mobile)
  await updateCredits();
  // Set up any modals (if needed) for profile editing
  setupProfileModals(username);
  // Initialize carousels for profile sections
  await initProfileCarousels(username);

  // Attach logout functionality to the desktop navbar logout button
  const logoutBtnNavbar = document.getElementById('logout-btn-navbar');
  if (logoutBtnNavbar) {
    logoutBtnNavbar.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Redirect to homepage (or a login page)
    });
  }

  // Attach logout functionality to the mobile logout button (if it exists)
  const logoutBtnMobile = document.getElementById('logout-btn-mobile');
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    });
  }
});
