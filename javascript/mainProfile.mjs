import './main.mjs';
import { updateProfile, updateCredits } from './api/profile.mjs';
import { setupProfileModals } from './utils/profileModals.mjs';
import { initProfileListings } from './utils/profileListings.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user?.data?.name) {
    window.location.href = '/login.html';
    return;
  }

  try {
    // Update profile data
    await updateProfile(user.data.name);
    await updateCredits();
    
    // Initialize profile sections
    await initProfileListings(user.data.name);
    
    // Set up modals
    setupProfileModals(user.data.name);

    // Logout handlers
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    };
    
    document.getElementById('logout-btn-navbar')?.addEventListener('click', handleLogout);
    document.getElementById('logout-btn-mobile')?.addEventListener('click', handleLogout);

  } catch (error) {
    console.error('Profile initialization failed:', error);
    alert('Error loading profile data. Please try refreshing.');
  }
});