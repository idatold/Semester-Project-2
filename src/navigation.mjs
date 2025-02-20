// /src/hamburgerMenu.js
export function setupHamburgerMenu({
  menuBtnSelector = '#menu-btn',
  closeBtnSelector = '#close-menu',
  mobileMenuSelector = '#mobile-menu',
} = {}) {
  const menuBtn = document.querySelector(menuBtnSelector);
  const closeBtn = document.querySelector(closeBtnSelector);
  const mobileMenu = document.querySelector(mobileMenuSelector);

  if (!menuBtn || !mobileMenu || !closeBtn) {
    console.warn(
      'Hamburger menu setup: Missing menuBtn, closeBtn, or mobileMenu elements.'
    );
    return;
  }

  // Open menu
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
  });

  // Close menu
  closeBtn.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
  });
}

