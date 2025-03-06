import { registerUser, handleLogin } from './auth/auth.mjs';

export function initProfileModal() {
  const profileBtn = document.getElementById('profile-btn');
  const profileModal = document.getElementById('profile-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const backdrop = document.getElementById('backdrop');
  const slider = document.getElementById('slider');

  const showRegisterBtn = document.getElementById('show-register');
  const showLoginBtn = document.getElementById('show-login');

  // Function to open the modal
  function openModal() {
    profileModal.classList.remove('hidden');
    profileModal.setAttribute('aria-hidden', 'false');
  }

  // Function to close the modal
  function closeModal() {
    profileModal.classList.add('hidden');
    profileModal.setAttribute('aria-hidden', 'true');
  }

  

  // Check if user is logged in by verifying the token in localStorage.
  if (localStorage.getItem('token')) {
    // Replace the button content with the profile SVG.
    profileBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
        <path
          d="M17.1905 19.4195C17.1588 19.4195 17.1114 19.4195 17.0798 19.4195C17.0323 19.4195 16.9691 19.4195 16.9216 19.4195C13.3318 19.3088 10.6434 16.5098 10.6434 13.0623C10.6434 9.5516 13.5058 6.68927 17.0165 6.68927C20.5272 6.68927 23.3895 9.5516 23.3895 13.0623C23.3737 16.5256 20.6695 19.3088 17.2379 19.4195C17.2063 19.4195 17.2063 19.4195 17.1905 19.4195ZM17.0007 9.04555C14.7867 9.04555 12.9997 10.8483 12.9997 13.0465C12.9997 15.213 14.6919 16.9684 16.8426 17.0474C16.89 17.0316 17.0481 17.0316 17.2063 17.0474C19.3253 16.9367 20.9858 15.1972 21.0016 13.0465C21.0016 10.8483 19.2146 9.04555 17.0007 9.04555Z"
          fill="#956B1B"
        />
        <path
          d="M17.0014 34.0001C12.7474 34.0001 8.68323 32.4188 5.53626 29.5406C5.25161 29.2876 5.12509 28.9081 5.15672 28.5443C5.3623 26.6625 6.53254 24.9071 8.47765 23.6104C13.1902 20.4792 20.8283 20.4792 25.5251 23.6104C27.4702 24.9229 28.6404 26.6625 28.846 28.5443C28.8935 28.9239 28.7511 29.2876 28.4665 29.5406C25.3195 32.4188 21.2553 34.0001 17.0014 34.0001ZM7.63951 28.2281C10.2646 30.4262 13.5697 31.6281 17.0014 31.6281C20.433 31.6281 23.7381 30.4262 26.3632 28.2281C26.0786 27.2634 25.3195 26.3304 24.1967 25.5713C20.3065 22.9778 13.7121 22.9778 9.79021 25.5713C8.66742 26.3304 7.92416 27.2634 7.63951 28.2281Z"
          fill="#956B1B"
        />
        <path
          d="M17 34C7.62233 34 0 26.3777 0 17C0 7.62233 7.62233 0 17 0C26.3777 0 34 7.62233 34 17C34 26.3777 26.3777 34 17 34ZM17 2.37209C8.93488 2.37209 2.37209 8.93488 2.37209 17C2.37209 25.0651 8.93488 31.6279 17 31.6279C25.0651 31.6279 31.6279 25.0651 31.6279 17C31.6279 8.93488 25.0651 2.37209 17 2.37209Z"
          fill="#956B1B"
        />
      </svg>
    `;
    // Only initialize the dropdown for logged in users.
    initProfileDropdown();
  } else {
    // Logged out: show "Login" text and bind modal open event.
    profileBtn.innerHTML = `<span id="profile-btn-text">Login</span>`;
    profileBtn.addEventListener('click', openModal);
  }

  // Attach modal close events.
  closeModalBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // Slide switching logic for the modal.
  showRegisterBtn.addEventListener('click', () => {
    slider.style.transform = 'translateX(-50%)';
  });
  showLoginBtn.addEventListener('click', () => {
    slider.style.transform = 'translateX(0%)';
  });

  // Registration form submission.
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;

      try {
        const data = await registerUser(username, email, password);
      
        alert('Registration successful! Please log in.');
        slider.style.transform = 'translateX(0%)';
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }

  // Login form submission.
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        // handleLogin stores token and user info in localStorage.
        await handleLogin({ email, password }, (user) => {
   
        });
        alert('Login successful!');
        window.location.href = '/profile/';
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
      }
    });
  }
}

// New function to initialize the dropdown for logged in users.
function initProfileDropdown() {
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.getElementById('profile-dropdown');
  const logoutBtn = document.getElementById('logout-btn');

  // Toggle dropdown when clicking the profile button.
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the event from bubbling up.
    profileDropdown.classList.toggle('hidden');
  });

  // Prevent clicks within the dropdown from bubbling up.
  profileDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Global listener: close the dropdown when clicking outside.
  document.addEventListener('click', () => {
    if (!profileDropdown.classList.contains('hidden')) {
      profileDropdown.classList.add('hidden');
    }
  });

  // Logout functionality.
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  });
}
