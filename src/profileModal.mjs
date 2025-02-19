
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
      // If you have a 2-slide layout, each at 50% width => total 200% width
      // Sliding -50% reveals the second slide
      slider.style.transform = 'translateX(-50%)';
    });
  
    // 4. Slide to LOGIN (translate slider back to 0%)
    showLoginBtn.addEventListener('click', () => {
      slider.style.transform = 'translateX(0%)';
    });
  }
  
  