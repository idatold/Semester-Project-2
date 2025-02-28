import './main.mjs';  
import { getActiveListings } from './api/listings.mjs'; // NEW: fetch active auctions
// Everything else remains the same

const listingsContainer = document.getElementById('listings-container');

/**
 * Truncate text to `maxChars` and add "..." if needed.
 */
function truncateText(text = '', maxChars = 50) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + '...';
}

/**
 * Compute the actual time remaining until `endsAt`.
 */
function getTimeRemaining(endsAt) {
  if (!endsAt) return 'N/A';

  const now = new Date();
  const end = new Date(endsAt);
  const diffMs = end - now;

  if (diffMs <= 0) {
    return 'Ended';
  }

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
 * Render a single listing card
 * (Exactly the same as your snippet)
 */
function renderListing(listing) {
  const { id, title, description, media, endsAt } = listing;

  // 1) Create the card (322×440)
  const card = document.createElement('div');
  card.className = 'bg-white shadow-md rounded-lg overflow-hidden flex flex-col';
  card.style.width = '322px';
  card.style.height = '440px';

  // 2) Image container (224px tall)
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

  // 3) Text area (216px tall => 440 - 224)
  const textArea = document.createElement('div');
  textArea.className = 'flex flex-col justify-between';
  textArea.style.width = '100%';
  textArea.style.height = '216px';
  textArea.style.padding = '0 16px 16px 16px';

  // Title/description wrapper
  const textWrapper = document.createElement('div');

  const h2 = document.createElement('h2');
  h2.className = 'text-l font-bold mb-4';
  h2.textContent = truncateText(title || 'Untitled', 30);

  const descP = document.createElement('p');
  descP.className = 'text-gray-600 mb-1';
  descP.textContent = truncateText(description || 'No description provided.', 60);
  descP.style.fontFamily = 'Beiruti';

  const bidP = document.createElement('p');
  bidP.className = 'font-semibold text-m';
  bidP.textContent = 'Current Bid: 2300';
  bidP.style.fontFamily = 'Beiruti';

  const timeP = document.createElement('p');
  timeP.className = 'text-m text-gray-500';
  const remaining = getTimeRemaining(endsAt);
  timeP.textContent = `Time remaining: ${remaining}`;
  timeP.style.fontFamily = 'Beiruti';

  textWrapper.appendChild(h2);
  textWrapper.appendChild(descP);
  textWrapper.appendChild(bidP);
  textWrapper.appendChild(timeP);

  // Center the "View Listing" button
  const buttonWrapper = document.createElement('div');
  buttonWrapper.style.width = '100%';
  buttonWrapper.style.textAlign = 'center';

  const viewBtn = document.createElement('button');
  viewBtn.textContent = 'View Listing';
  viewBtn.className = 'mt-2 text-white px-4 py-2 rounded transition';
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
}

// --------------- INFINITE SCROLL + ACTIVE FETCH ---------------

// Track page, loading state, and whether more pages exist
let currentPage = 1;
let isLoading = false;
let hasMore = true;

/**
 * Load a specific page of active auctions
 */
async function loadListings(page) {
  isLoading = true;
  try {
    // We'll call our new getActiveListings(page) function
    // which returns { data: [...], meta: {...} }
    const response = await getActiveListings(page);
    const { data, meta } = response;

    // If it's page 1 and container still says "Loading auctions...", clear it
    if (page === 1 && listingsContainer.innerHTML === 'Loading auctions...') {
      listingsContainer.innerHTML = '';
    }

    // Render each listing with your existing "renderListing"
    data.forEach(renderListing);

    // If meta indicates last page, set hasMore = false
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
 * Setup infinite scroll
 */
function initInfiniteScroll() {
  window.addEventListener('scroll', async () => {
    // If near bottom and not loading, load next page
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
      if (!isLoading && hasMore) {
        currentPage++;
        await loadListings(currentPage);
      }
    }
  });
}

/**
 * Initialize listings on page load
 */
async function initListings() {
  listingsContainer.innerHTML = 'Loading auctions...';

  // 1) Load page 1
  await loadListings(currentPage);

  // 2) Set up infinite scroll
  initInfiniteScroll();
}

// Finally, call initListings
initListings();
