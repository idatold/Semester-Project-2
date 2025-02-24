// carousel.mjs

export function initCarousel() {
    // Grab all slides and dots
    const slides = document.querySelectorAll('.fade-slide');
    const dots = document.querySelectorAll('#carousel-dots .dot');
  
    if (!slides.length || !dots.length) {
      console.warn('Carousel elements not found. Skipping init.');
      return;
    }
  
    let currentSlide = 0;
    let autoPlayInterval;
    const totalSlides = slides.length;
  
    // Show the specified slide, hide the others
    function showSlide(index) {
      slides.forEach((slide, i) => {
        if (i === index) {
          // Fade in
          slide.classList.remove('opacity-0', 'z-0');
          slide.classList.add('opacity-100', 'z-10');
        } else {
          // Fade out
          slide.classList.remove('opacity-100', 'z-10');
          slide.classList.add('opacity-0', 'z-0');
        }
      });
  
      // Update dot styles
      dots.forEach((dot, i) => {
        if (i === index) {
          // Active dot: bigger, slightly darker color
          dot.classList.remove('w-3', 'h-3', 'bg-[#C0AC87]');
          dot.classList.add('w-4', 'h-4', 'bg-[#AE9B74]');
        } else {
          // Inactive dot
          dot.classList.remove('w-4', 'h-4', 'bg-[#AE9B74]');
          dot.classList.add('w-3', 'h-3', 'bg-[#C0AC87]');
        }
      });
  
      currentSlide = index;
    }
  
    // Move to the next slide (wrap around)
    function nextSlide() {
      const newIndex = (currentSlide + 1) % totalSlides;
      showSlide(newIndex);
    }
  
    // Start auto-play (5 seconds)
    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }
  
    // Reset auto-play when user clicks a dot
    function resetAutoPlay() {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }
  
    // Initialize the first slide
    showSlide(0);
    startAutoPlay();
  
    // Dot click events
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-slide'), 10);
        showSlide(index);
        resetAutoPlay();
      });
    });
  }
  