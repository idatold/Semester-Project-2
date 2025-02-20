import './style.css'
import { setupHamburgerMenu } from './navigation.mjs';

setupHamburgerMenu({
  menuBtnSelector: '#menu-btn',
  closeBtnSelector: '#close-menu',
  mobileMenuSelector: '#mobile-menu',
});


import { initProfileModal } from './profileModal.mjs';

document.addEventListener('DOMContentLoaded', () => {
  initProfileModal();
});


