// profileModal.mjs

// 1. Import the register and login functions
import { registerUser, loginUser } from './auth/auth.mjs';

export function initProfileModal() {
  // Grab elements for opening/closing the modal
  const profileBtn = document.getElementById('profile-btn');
  const profileModal = document.getElementById('profile-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const backdrop = document.getElementById('backdrop');

  // Grab the slider container (which holds both login & register slides)
  const slider = document.getElementById('slider');

  // Buttons that switch slides
  const showRegisterBtn = document.getElementById('show-register');
  const showLoginBtn = document.getElementById('show-login');

  // 1. Show modal when profile button is clicked
  profileBtn.addEventListener('click', () => {
    profileModal.classList.remove('hidden');
    profileModal.setAttribute('aria-hidden', 'false');
  });

  // 2. Close modal function
  const closeModal = () => {
    profileModal.classList.add('hidden');
    profileModal.setAttribute('aria-hidden', 'true');
  };

  // Close modal when user clicks X or backdrop
  closeModalBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // 3. Slide to REGISTER (translate slider left by 50%)
  showRegisterBtn.addEventListener('click', () => {
    slider.style.transform = 'translateX(-50%)';
  });

  // 4. Slide to LOGIN (translate slider back to 0%)
  showLoginBtn.addEventListener('click', () => {
    slider.style.transform = 'translateX(0%)';
  });

  // 5. Handle REGISTER form submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Grab the input values
      const username = document.getElementById('register-username').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;

      try {
        // Call your registerUser function
        const data = await registerUser(username, email, password);
        console.log('Registration successful:', data);

        // If the API doesn't throw, we can assume success.
        // Show a success message to the user:
        alert('Registration successful! Please log in.');

        // Switch back to the login slide
        slider.style.transform = 'translateX(0%)';
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }

  // 6. Handle LOGIN form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        // Attempt to log in
        const data = await loginUser(email, password);
        console.log('Login response:', data);

        // If loginUser() already stores the token internally, we don't need to do it here.
        // But if you want to store userEmail or other data, you can:
        localStorage.setItem('userEmail', email);

        alert('Login successful!');

        // Then redirect to the profile page (or refresh, or close modal, etc.)
        window.location.href = './profile/index.html';
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
      }
    });
  }
}
