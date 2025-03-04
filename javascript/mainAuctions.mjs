// File: /javascript/mainAuctions.mjs
import './main.mjs';
import { getActiveListings } from './api/listings.mjs';
import { filterByCategory } from './utils/filterAuctions.mjs';
import { initProfileModal } from './loginAndRegisterModal.mjs';

document.addEventListener('DOMContentLoaded', () => {
  initProfileModal();
});
import {
  sortByNewest,
  sortByMostBids,
  sortByHighestPrice,
  sortByLowestPrice,
  sortByEndingSoonest,
} from './utils/sortAuctions.mjs';

import { updateCredits } from './api/profile.mjs';
updateCredits();

// DOM elements
const listingsContainer = document.getElementById('listings-container');
const categoryLinks = document.querySelectorAll('[data-category]');
const sortDropdown = document.getElementById('sortDropdown');

// --- Modal elements (for your profile modal) ---
const profileBtn = document.getElementById('profile-btn');
const modal = document.getElementById('profile-modal');
const backdrop = document.getElementById('backdrop');
const closeModalBtn = document.getElementById('close-modal');

// GLOBAL state
let allAuctions = [];
let currentPage = 1;
let isLoading = false;
let hasMore = true;

// Default filter & sort
let currentCategory = 'all';
let currentSort = 'newest'; // start with "newest"

/**
 * Truncate text to `maxChars`.
 */
function truncateText(text = '', maxChars = 50) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + '...';
}

/**
 * Compute time remaining until `endsAt`.
 */
function getTimeRemaining(endsAt) {
  if (!endsAt) return 'N/A';
  const now = new Date();
  const end = new Date(endsAt);
  const diffMs = end - now;
  if (diffMs <= 0) return 'Ended';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeStr = '';
  if (diffDays > 0) timeStr += `${diffDays}d `;
  if (diffHours > 0) timeStr += `${diffHours}h `;
  timeStr += `${diffMinutes}m`;
  return timeStr.trim();
}

/**
 * Find highest bid from a listing's bids array.
 */
function getHighestBid(bidsArray) {
  if (!bidsArray || bidsArray.length === 0) {
    return 'No bids yet';
  }
  const amounts = bidsArray.map((bid) => bid.amount);
  return Math.max(...amounts);
}

/**
 * Render an array of auctions into the listings container.
 */
function renderListings(auctions) {
  listingsContainer.innerHTML = '';

  if (!auctions || auctions.length === 0) {
    listingsContainer.innerHTML = '<p>No auctions found.</p>';
    return;
  }

  auctions.forEach((listing) => {
    const { id, title, description, media, endsAt, bids } = listing;

    // Card container
    const card = document.createElement('div');
    card.className = 'bg-white shadow-md rounded-lg overflow-hidden flex flex-col';
    card.style.width = '322px';
    card.style.height = '440px';

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.style.width = '100%';
    imageContainer.style.height = '224px';
    imageContainer.style.padding = '0 16px';
    imageContainer.style.display = 'flex';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.alignItems = 'center';

    const imageUrl = media?.[0]?.url || 'https://fakeimg.pl/600x400?text=??';
    const imageEl = document.createElement('img');
    imageEl.src = imageUrl;
    imageEl.alt = title || 'No title';
    imageEl.style.width = '281px';
    imageEl.style.height = '182px';
    imageEl.style.objectFit = 'cover';

    imageContainer.appendChild(imageEl);
    card.appendChild(imageContainer);

    // Text area
    const textArea = document.createElement('div');
    textArea.className = 'flex flex-col justify-between';
    textArea.style.width = '100%';
    textArea.style.height = '216px';
    textArea.style.padding = '0 16px 16px 16px';

    const textWrapper = document.createElement('div');

    const h2 = document.createElement('h2');
    h2.className = 'text-l font-bold mb-4';
    h2.textContent = truncateText(title || 'Untitled', 30);

    const descP = document.createElement('p');
    descP.className = 'text-gray-600 mb-1';
    descP.textContent = truncateText(description || 'No description provided.', 60);
    descP.style.fontFamily = 'Beiruti';

    const highestBid = getHighestBid(bids);
    const bidP = document.createElement('p');
    bidP.className = 'font-semibold text-m';
    bidP.textContent = `Current Bid: ${highestBid}`;
    bidP.style.fontFamily = 'Beiruti';

    const timeP = document.createElement('p');
    timeP.className = 'text-m text-gray-500';
    timeP.textContent = `Time remaining: ${getTimeRemaining(endsAt)}`;
    timeP.style.fontFamily = 'Beiruti';

    textWrapper.appendChild(h2);
    textWrapper.appendChild(descP);
    textWrapper.appendChild(bidP);
    textWrapper.appendChild(timeP);

    // "View Listing" button
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.width = '100%';
    buttonWrapper.style.textAlign = 'center';

    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View Listing';
    viewBtn.className = 'mt-2 text-white px-4 py-2 rounded transition text-sm';
    viewBtn.style.backgroundColor = '#9B7E47';

    viewBtn.addEventListener('mouseover', () => {
      viewBtn.style.backgroundColor = '#866C3C';
    });
    viewBtn.addEventListener('mouseout', () => {
      viewBtn.style.backgroundColor = '#9B7E47';
    });
    viewBtn.addEventListener('click', () => {
      window.location.href = `/auctions/listing/index.html?id=${id}`;
    });

    buttonWrapper.appendChild(viewBtn);

    textArea.appendChild(textWrapper);
    textArea.appendChild(buttonWrapper);
    card.appendChild(textArea);

    listingsContainer.appendChild(card);
  });
}

/**
 * Filter + sort + render
 */
function applyFilterAndSort() {
  // 1) Filter by category
  let filtered = filterByCategory(allAuctions, currentCategory);

  // 2) Sort
  let sorted = filtered;
  switch (currentSort) {
    case 'newest':
      sorted = sortByNewest(filtered);
      break;
    case 'mostBids':
      sorted = sortByMostBids(filtered);
      break;
    case 'highestPrice':
      sorted = sortByHighestPrice(filtered);
      break;
    case 'lowestPrice':
      sorted = sortByLowestPrice(filtered);
      break;
    case 'endingSoonest':
      sorted = sortByEndingSoonest(filtered);
      break;
    default:
      break;
  }

  renderListings(sorted);
}

/**
 * Load a specific page of active auctions
 */
async function loadListings(page) {
  isLoading = true;
  try {
    const response = await getActiveListings(page);
    console.log('getActiveListings response:', response);

    // Expected response shape: { data: [...], meta: {...} }
    const { data, meta } = response;

    if (page === 1 && listingsContainer.innerHTML === 'Loading auctions...') {
      listingsContainer.innerHTML = '';
    }

    allAuctions.push(...data);
    applyFilterAndSort();

    if (meta.isLastPage) {
      hasMore = false;
    }
  } catch (error) {
    console.error(`Failed to load listings for page ${page}:`, error);
  } finally {
    isLoading = false;
  }
}

/**
 * Infinite scroll setup
 */
function initInfiniteScroll() {
  window.addEventListener('scroll', async () => {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
      if (!isLoading && hasMore) {
        currentPage++;
        await loadListings(currentPage);
      }
    }
  });
}

/**
 * Initialize the page
 */
async function initAuctionsPage() {
  // Check for query parameter 'category' and set currentCategory accordingly.
  const params = new URLSearchParams(window.location.search);
  if (params.has('category')) {
    currentCategory = params.get('category');
  }
  
  // Set sort dropdown default
  if (sortDropdown) {
    sortDropdown.value = 'newest';
  }
  
  listingsContainer.innerHTML = 'Loading auctions...';

  // Start with page 1
  await loadListings(currentPage);

  // Set up infinite scroll
  initInfiniteScroll();

  // -------------- MODAL LOGIC --------------
  // Only attach if elements exist
  if (profileBtn && modal && backdrop && closeModalBtn) {
    if (!localStorage.getItem('token')) {
      // For logged-out users, attach modal open/close listeners.
      profileBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
      closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
      backdrop.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    } else {
      // Logged in: ensure the modal is hidden.
      modal.classList.add('hidden');
    }
  }
}

// Category link clicks
categoryLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const selectedCategory = link.dataset.category || 'all';
    // If not on auctions page, redirect with query parameter.
    if (!window.location.pathname.includes('/auctions/')) {
      window.location.href = `/auctions/index.html?category=${encodeURIComponent(selectedCategory)}`;
    } else {
      currentCategory = selectedCategory;
      applyFilterAndSort();
    }
  });
});

// Sort dropdown changes
if (sortDropdown) {
  sortDropdown.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFilterAndSort();
  });
}

// File: /javascript/mainAuctions.mjs

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Load auctions
  const { data: auctions } = await getActiveListings(); // example
  // 2) Check search param
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('search')?.trim()?.toLowerCase() || '';
  // 3) Filter by title
  let filtered = auctions;
  if (searchQuery) {
    filtered = auctions.filter((item) =>
      item.title.toLowerCase().includes(searchQuery)
    );
  }
  // 4) Render
  renderListings(filtered);
});


// Kick off the page initialization
initAuctionsPage();
