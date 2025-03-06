import './css/style.css'
import { setupHamburgerMenu } from './navigation.mjs';
import { showLoadingSpinner, hideLoadingSpinner } from './utils/loadingspinner.mjs';

// Show the spinner overlay
showLoadingSpinner();

// Hide it after 2 seconds (2000 milliseconds)
setTimeout(() => {
  hideLoadingSpinner();
}, 2000);




setupHamburgerMenu({
  menuBtnSelector: '#menu-btn',
  closeBtnSelector: '#close-menu',
  mobileMenuSelector: '#mobile-menu',
});

import { initSearchBar } from './utils/searchBar.mjs';

document.addEventListener('DOMContentLoaded', () => {
  initSearchBar();
});










