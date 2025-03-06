import './main.mjs';

import { initCarousel } from './carouselIndex.mjs';
import { updateCredits } from './api/profile.mjs';
import { initProfileModal } from './loginAndRegisterModal.mjs';
import { filterByCategory } from './utils/filterAuctions.mjs';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize common functionality
  initCarousel();
  updateCredits();
  initProfileModal();

  // Category filtering for index page
  const categoryLinks = document.querySelectorAll('[data-category]');
  categoryLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedCategory = link.dataset.category || 'all';
      // Check if auctions are visible on this page by testing for the listings container
      const listingsContainer = document.getElementById('listings-container');
      if (!listingsContainer) {
        // No listings container means we're not on the auctions page—redirect with query parameter.
        window.location.href = `/auctions/index.html?category=${encodeURIComponent(selectedCategory)}`;
      } else {
        // If auctions are present, update filtering directly.
        if (typeof window.applyFilterAndSort === 'function') {
          window.currentCategory = selectedCategory;
          window.applyFilterAndSort();
        } else {
          console.error("Global filtering function (applyFilterAndSort) is not defined.");
        }
      }
    });
  });

  // Mobile auth button handling
  const mobileAuthBtn = document.getElementById('mobile-auth-btn');
  const mobileProfileLink = document.getElementById('mobile-profile-link');
  if (mobileAuthBtn && mobileProfileLink) {
    if (localStorage.getItem('token')) {
      // User is logged in: show the Profile link and update auth button to "Log Out"
      mobileAuthBtn.textContent = 'Log Out';
      mobileProfileLink.classList.remove('hidden');
      mobileAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      });
    } else {
      // User is not logged in: hide the Profile link and set auth button to "Login"
      mobileAuthBtn.textContent = 'Login';
      mobileProfileLink.classList.add('hidden');
      mobileAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
          profileBtn.click();
        }
      });
    }
  }

  // Become a member link handling (open register modal)
  const becomeMemberLink = document.getElementById('become-member');
  if (becomeMemberLink) {
    becomeMemberLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Open the modal if it's hidden
      const profileModal = document.getElementById('profile-modal');
      if (profileModal && profileModal.classList.contains('hidden')) {
        profileModal.classList.remove('hidden');
        profileModal.setAttribute('aria-hidden', 'false');
      }
      // Simulate clicking the "show-register" button to slide to register view
      const showRegisterBtn = document.getElementById('show-register');
      if (showRegisterBtn) {
        showRegisterBtn.click();
      }
    });
  }
});
