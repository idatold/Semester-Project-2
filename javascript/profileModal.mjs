// File: /javascript/profileModal.mjs
import { registerUser, handleLogin } from './auth/auth.mjs';

export function initProfileModal() {
  const profileBtn = document.getElementById('profile-btn');
  const profileModal = document.getElementById('profile-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const backdrop = document.getElementById('backdrop');
  const slider = document.getElementById('slider');

  const showRegisterBtn = document.getElementById('show-register');
  const showLoginBtn = document.getElementById('show-login');

  // Open modal
  profileBtn.addEventListener('click', () => {
    profileModal.classList.remove('hidden');
    profileModal.setAttribute('aria-hidden', 'false');
  });

  // Close modal
  const closeModal = () => {
    profileModal.classList.add('hidden');
    profileModal.setAttribute('aria-hidden', 'true');
  };
  closeModalBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // Switch slides
  showRegisterBtn.addEventListener('click', () => {
    slider.style.transform = 'translateX(-50%)';
  });
  showLoginBtn.addEventListener('click', () => {
    slider.style.transform = 'translateX(0%)';
  });

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;

      try {
        const data = await registerUser(username, email, password);
        console.log('Registration successful:', data);
        alert('Registration successful! Please log in.');
        slider.style.transform = 'translateX(0%)';
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        // handleLogin => stores token under "token" & user object in localStorage
        await handleLogin({ email, password }, (user) => {
          console.log('User set:', user);
        });
        alert('Login successful!');
        window.location.href = '/profile/index.html';
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
      }
    });
  }
}
