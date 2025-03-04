import './css/style.css'
import { setupHamburgerMenu } from './navigation.mjs';

setupHamburgerMenu({
  menuBtnSelector: '#menu-btn',
  closeBtnSelector: '#close-menu',
  mobileMenuSelector: '#mobile-menu',
});



import { initSearchBar } from './utils/searchBar.mjs';

document.addEventListener('DOMContentLoaded', () => {
  // other universal inits, e.g. hamburger toggler, etc.
  initSearchBar(); // This will attach the event listener to .searchBar
});




