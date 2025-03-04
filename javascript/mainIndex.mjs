import './main.mjs';

import { initCarousel } from './carouselIndex.mjs';
document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
});

import { updateCredits } from './api/profile.mjs';
updateCredits();

import { initProfileModal } from './loginAndRegisterModal.mjs';
document.addEventListener('DOMContentLoaded', () => {
  initProfileModal();
});

import { filterByCategory } from './utils/filterAuctions.mjs';

// Make sure to select category links from your DOM
const categoryLinks = document.querySelectorAll('[data-category]');

// On category link click, if not on the auctions page, redirect with the category query parameter.
categoryLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const selectedCategory = link.dataset.category || 'all';
    if (!window.location.pathname.includes('/auctions/')) {
      // Redirect to the auctions page with a query parameter.
      window.location.href = `/auctions/index.html?category=${encodeURIComponent(selectedCategory)}`;
    } else {
      // If already on the auctions page, apply the filter directly.
      currentCategory = selectedCategory; // currentCategory should be a global variable on auctions page.
      applyFilterAndSort();             // applyFilterAndSort should filter and render the auctions.
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const mobileAuthBtn = document.getElementById('mobile-auth-btn');
  if (!mobileAuthBtn) return;
  
  if (localStorage.getItem('token')) {
    // User is logged in: set text to "Log Out" and attach logout functionality.
    mobileAuthBtn.textContent = 'Log Out';
    mobileAuthBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    });
  } else {
    // User is not logged in: set text to "Login" and simulate a click on the desktop profile button to open the modal.
    mobileAuthBtn.textContent = 'Login';
    mobileAuthBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const profileBtn = document.getElementById('profile-btn');
      if (profileBtn) {
        profileBtn.click();
      }
    });
  }
});
