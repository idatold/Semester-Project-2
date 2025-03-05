// File: /javascript/utils/profileCarousels.mjs
import api from '../api/axios.mjs';

export async function initProfileCarousels(username) {
  // 1) My Active Auctions
  await setupSingleCarousel({
    endpoint: `/auction/profiles/${username}/listings?_active=true`,
    listSelector: '.carousel-list-active',
    leftArrowId: 'left-active',
    rightArrowId: 'right-active',
    fallbackMessage: 'No active auctions found.',
  });

  // 2) My Wins
  await setupSingleCarousel({
    endpoint: `/auction/profiles/${username}/wins`,
    listSelector: '.carousel-list-wins',
    leftArrowId: 'left-wins',
    rightArrowId: 'right-wins',
    fallbackMessage: 'No wins found.',
  });
}

async function setupSingleCarousel({
  endpoint,
  listSelector,
  leftArrowId,
  rightArrowId,
  fallbackMessage,
}) {
  const carousel = document.querySelector(listSelector);
  const leftArrow = document.getElementById(leftArrowId);
  const rightArrow = document.getElementById(rightArrowId);

  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let firstCardWidth = 0;

  if (!carousel) {
    console.error(`Carousel element not found: ${listSelector}`);
    return;
  }

  // Fetch data from the API
  const data = await fetchAuctions(endpoint);

  // If no data, show a fallback card
  if (!data || data.length === 0) {
    carousel.innerHTML = `<li class="carousel-card">${fallbackMessage}</li>`;
    return;
  }

  // Render the auction cards
  createCarouselCards(data, carousel);

  // Calculate first card width & set up infinite scroll
  const firstCard = carousel.querySelector('.carousel-card');
  if (firstCard) {
    firstCardWidth = firstCard.offsetWidth;
    const cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);
    duplicateCarouselCards(carousel, cardPerView);
  }

  // Arrow & drag events
  carousel.addEventListener('mousedown', dragStart);
  carousel.addEventListener('mousemove', dragging);
  document.addEventListener('mouseup', dragStop);
  carousel.addEventListener('scroll', infiniteScroll);

  [leftArrow, rightArrow].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      carousel.scrollLeft += btn.id.includes('left')
        ? -firstCardWidth
        : firstCardWidth;
    });
  });

  function dragStart(e) {
    isDragging = true;
    carousel.classList.add('dragging');
    startX = e.pageX;
    startScrollLeft = carousel.scrollLeft;
  }

  function dragging(e) {
    if (!isDragging) return;
    carousel.scrollLeft = startScrollLeft + (startX - e.pageX);
  }

  function dragStop() {
    isDragging = false;
    carousel.classList.remove('dragging');
  }

  function infiniteScroll() {
    if (carousel.scrollLeft <= 0) {
      carousel.classList.add('no-transition');
      carousel.scrollLeft = carousel.scrollWidth - 2 * carousel.offsetWidth;
      carousel.classList.remove('no-transition');
    } else if (
      Math.ceil(carousel.scrollLeft) >=
      carousel.scrollWidth - carousel.offsetWidth
    ) {
      carousel.classList.add('no-transition');
      carousel.scrollLeft = carousel.offsetWidth;
      carousel.classList.remove('no-transition');
    }
  }
}

async function fetchAuctions(endpoint) {
  try {
    const response = await api.get(endpoint);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return [];
  }
}

function createCarouselCards(dataArray, carousel) {
  carousel.innerHTML = '';
  dataArray.forEach((auction) => {
    const li = document.createElement('li');
    li.classList.add('carousel-card');

    const mediaWrapper = document.createElement('div');
    mediaWrapper.classList.add('carousel-img');
    const img = document.createElement('img');
    const firstMedia = auction.media?.[0];
    img.src = firstMedia?.url || 'assets/images/default-image.png';
    img.alt = firstMedia?.alt || 'Auction Image';
    mediaWrapper.appendChild(img);

    const title = document.createElement('h2');
    title.classList.add('carousel-title');
    title.textContent = auction.title || 'Untitled Auction';

    const link = document.createElement('a');
    link.classList.add('carousel-link');
    link.href = `/auction.html?id=${auction.id}`;
    link.textContent = 'View Auction';

    // Entire card clickable
    li.addEventListener('click', (e) => {
      if (!e.target.classList.contains('carousel-link')) {
        window.location.href = `/auction.html?id=${auction.id}`;
      }
    });

    li.appendChild(mediaWrapper);
    li.appendChild(title);
    li.appendChild(link);
    carousel.appendChild(li);
  });
}

function duplicateCarouselCards(carousel, cardPerView) {
  const children = [...carousel.children];
  // Copies of last few cards to the front
  children.slice(-cardPerView).forEach((card) => {
    carousel.insertAdjacentHTML('afterbegin', card.outerHTML);
  });
  // Copies of first few cards to the end
  children.slice(0, cardPerView).forEach((card) => {
    carousel.insertAdjacentHTML('beforeend', card.outerHTML);
  });
}
