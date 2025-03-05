// File: /javascript/mainAuctions.mjs

import './main.mjs';
import {
  getAllListings, // We'll pass `?_limit=20` inside this function
  createListing,
  updateListing,
  deleteListing,
} from './api/listings.mjs';
import { filterByCategory } from './utils/filterAuctions.mjs';
import { initProfileModal } from './loginAndRegisterModal.mjs';
import {
  sortByNewest,
  sortByMostBids,
  sortByHighestPrice,
  sortByLowestPrice,
  sortByEndingSoonest,
} from './utils/sortAuctions.mjs';
import { updateCredits } from './api/profile.mjs';


// DOM references
const listingsContainer = document.getElementById('listings-container');
const categoryLinks = document.querySelectorAll('[data-category]');
const sortDropdown = document.getElementById('sortDropdown');

// Login modal references
const profileBtn = document.getElementById('profile-btn');
const modal = document.getElementById('profile-modal');
const backdrop = document.getElementById('backdrop');
const closeModalBtn = document.getElementById('close-modal');

// "New Listing" button + create listing modal references
const newListingBtn = document.getElementById('new-listing-btn');
const createListingModal = document.getElementById('create-listing-modal');
const createListingBackdrop = document.getElementById('createListingBackdrop');
const closeCreateListingBtn = document.getElementById('close-create-listing');
const createListingForm = document.getElementById('create-listing-form');

// "Update Listing" modal references
const updateListingModal = document.getElementById('update-listing-modal');
const updateListingBackdrop = document.getElementById('updateListingBackdrop');
const closeUpdateListingBtn = document.getElementById('close-update-listing');
const updateListingForm = document.getElementById('update-listing-form');

// GLOBAL state
let allAuctions = [];
let currentPage = 1; // Start at page 1
let isLoading = false;
let hasMore = true;  // We'll set this false when meta.isLastPage is true

let currentCategory = 'all'; // default
let currentSort = 'newest';  // default

// 1) Update credits (show how many credits the user has, if logged in)
updateCredits();

// 2) Initialize the login/register modal from your separate script
document.addEventListener('DOMContentLoaded', () => {
  initProfileModal();
});

/**
 * Truncate text to `maxChars`.
 */
function truncateText(text = '', maxChars = 50) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + '...';
}

// Hide Ended checkbox logic (unchanged)
let hideEnded = false;
const hideEndedWrapper = document.createElement('div');
hideEndedWrapper.className = 'flex items-center mt-2';
const hideEndedCheckbox = document.createElement('input');
hideEndedCheckbox.type = 'checkbox';
hideEndedCheckbox.id = 'hideEndedCheckbox';
hideEndedCheckbox.className = 'mr-1';
const hideEndedLabel = document.createElement('label');
hideEndedLabel.htmlFor = 'hideEndedCheckbox';
hideEndedLabel.textContent = 'Hide Ended';
hideEndedWrapper.appendChild(hideEndedCheckbox);
hideEndedWrapper.appendChild(hideEndedLabel);
if (sortDropdown && sortDropdown.parentNode) {
  sortDropdown.parentNode.insertBefore(hideEndedWrapper, sortDropdown.nextSibling);
}
hideEndedCheckbox.addEventListener('change', (e) => {
  hideEnded = e.target.checked;
  applyFilterAndSort();
});

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
  const diffMinutes = Math.floor((diffMs % (1000 * 60)) / (1000 * 60));

  let timeStr = '';
  if (diffDays > 0) timeStr += `${diffDays}d `;
  if (diffHours > 0) timeStr += `${diffHours}h `;
  timeStr += `${diffMinutes}m`;
  return timeStr.trim();
}

/**
 * Find highest bid
 */
function getHighestBid(bidsArray) {
  if (!bidsArray || bidsArray.length === 0) {
    return 'No bids yet';
  }
  const amounts = bidsArray.map((bid) => bid.amount);
  return Math.max(...amounts);
}

export function renderListings(auctions, container = listingsContainer) {
  container.innerHTML = '';

  if (!auctions || auctions.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center">No auctions found.</p>';
    return;
  }

  const truncate = (text = '', max = 50) => 
    text.length > max ? text.substring(0, max - 3) + '...' : text;

  const getTimeLeft = (endsAt) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diffMs = end - now;
    if (diffMs <= 0) return 'Ended';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const loggedInUsername = user?.data?.name || null;

  auctions.forEach((listing) => {
    const { id, title, description, media, endsAt, bids, seller } = listing;
    const highestBid = bids?.length > 0 
      ? Math.max(...bids.map(b => b.amount))
      : 'No bids yet';

    const card = document.createElement('div');
    card.className = 'bg-white shadow-md rounded-lg overflow-hidden flex flex-col w-full h-full hover:shadow-lg transition-shadow group';

    // Media section
    const mediaUrl = media?.[0]?.url || 'https://fakeimg.pl/600x400?text=??';
    const mediaAlt = media?.[0]?.alt || title || 'Auction image';
    
    card.innerHTML = `
      <div class="w-full h-48 flex items-center justify-center p-4 bg-gray-100 cursor-pointer">
        <img src="${mediaUrl}" 
             alt="${mediaAlt}" 
             class="object-cover w-full h-full rounded-lg">
      </div>

      <div class="p-4 flex flex-col justify-between flex-grow">
        <div class="cursor-pointer">
          <h2 class="text-base font-bold mb-2 font-heading">
            ${truncate(title || 'Untitled Auction', 40)}
          </h2>

          <p class="text-gray-600 text-sm mb-2 line-clamp-3 font-beiruti">
            ${truncate(description || 'No description provided', 100)}
          </p>

          <div class="flex justify-between items-center text-sm font-beiruti mt-3">
            <span class="font-semibold text-gray-700">
              ${typeof highestBid === 'number' ? `Current bid: $${highestBid}` : highestBid}
            </span>
            <span class="${new Date(endsAt) < new Date() ? 'text-red-600' : 'text-blue-600'} font-medium">
              ${getTimeLeft(endsAt)}
            </span>
          </div>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <a href="/auctions/listing/index.html?id=${id}" 
             class="view-btn text-white px-3 py-1.5 rounded transition text-sm bg-[#9B7E47] hover:bg-[#866C3C] font-beiruti">
            View Listing
          </a>
          
          ${loggedInUsername && seller?.name === loggedInUsername ? `
            <div class="flex gap-2">
              <button class="update-btn p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
                      data-id="${id}"
                      aria-label="Edit listing">
                <svg class="w-4 h-4 text-gray-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
              <button class="delete-btn p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
                      data-id="${id}"
                      aria-label="Delete listing">
                <svg class="w-4 h-4 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Card click handler
    const handleCardClick = (e) => {
      if (!e.target.closest('button') && !e.target.closest('a')) {
        window.location.href = `/auctions/listing/index.html?id=${id}`;
      }
    };

    // Add click handlers to clickable areas
    card.querySelectorAll('.cursor-pointer').forEach(element => {
      element.addEventListener('click', handleCardClick);
    });

    // Button handlers
    if (loggedInUsername && seller?.name === loggedInUsername) {
      card.querySelector('.update-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openUpdateListingModal(listing);
      });
      
      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDeleteListing(id);
      });
    }

    container.appendChild(card);
  });
}

// Update your listings container HTML class to match profile cards:
// Change this in your HTML:
// <div id="listings-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto justify-items-center"></div>
/**
 * Open the new "Update Listing" modal with existing data
 */
function openUpdateListingModal(listing) {
  if (!updateListingModal) return;

  // Fill the fields
  document.getElementById('update-listing-title').value = listing.title || '';
  document.getElementById('update-listing-description').value =
    listing.description || '';
  document.getElementById('update-listing-tags').value = listing.tags
    ? listing.tags.join(',')
    : '';
  document.getElementById('update-listing-media').value =
    listing.media && listing.media[0] ? listing.media[0].url : '';

  if (listing.endsAt) {
    const dt = new Date(listing.endsAt);
    document.getElementById('update-listing-endsAt').value = dt
      .toISOString()
      .slice(0, 16); // "YYYY-MM-DDTHH:MM"
  }

  // Store listing.id in a data attribute
  updateListingModal.dataset.listingId = listing.id;

  // Show the modal
  updateListingModal.classList.remove('hidden');
  updateListingModal.setAttribute('aria-hidden', 'false');
}


async function onDeleteListing(listingId) {
  if (!confirm('Are you sure you want to delete this listing?')) return;

  try {
    await deleteListing(listingId);
    alert('Listing deleted!');
    // Reset and refresh
    allAuctions = [];
    currentPage = 1;
    hasMore = true;
    listingsContainer.innerHTML = 'Loading auctions...';
    await loadListings(currentPage);
  } catch (error) {
    console.error('Failed to delete listing:', error);
    alert('Delete failed. Check console for details.');
  }
}

/**
 * Filter + sort + render
 */
function applyFilterAndSort() {
  let filtered = filterByCategory(allAuctions, currentCategory);

  if (hideEnded) {
    console.log("Hiding ended auctions...");
    const now = new Date();
    filtered = filtered.filter((auction) => new Date(auction.endsAt) > now);
  }

  let sorted = filtered;
  switch (currentSort) {
    case 'allListings':
      console.log("No custom sort => showing listings as returned");
      sorted = filtered;
      break;
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
 * Load more button
 */
function initLoadMoreButton() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', async () => {
    console.log("Load More clicked!", { isLoading, hasMore, currentPage });
    if (!isLoading && hasMore) {
      currentPage++;
      console.log("Loading next page:", currentPage);
      await loadListings(currentPage);
    }
  });
}


async function loadListings(page) {
  isLoading = true;
  try {
    console.log('Loading page', page);
    
    const response = await getAllListings(page, 20);
    console.log('Response:', response);

    const { data, meta } = response;

    // Always clear listings when loading a new page
    if (page === 1) {
      allAuctions = [];
    }

    // Only add NEW listings that don't already exist
    const newListings = data.filter(newListing => 
      !allAuctions.some(existing => existing.id === newListing.id)
    );
    
    allAuctions = [...allAuctions, ...newListings];
    
    applyFilterAndSort();

    // Update hasMore state based on API response
    hasMore = !meta.isLastPage && newListings.length > 0;
    
    // Update load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = hasMore ? 'block' : 'none';
      if (!hasMore && allAuctions.length > 0) {
        loadMoreBtn.textContent = 'No more listings';
      }
    }
    
  } catch (error) {
    console.error('Loading failed:', error);
    hasMore = false;
  } finally {
    isLoading = false;
  }
}



async function initAuctionsPage() {
  console.log('initAuctionsPage called');

  const params = new URLSearchParams(window.location.search);
  if (params.has('category')) {
    currentCategory = params.get('category');
  }

  initSearch();

  if (sortDropdown) {
    sortDropdown.value = 'newest';
  }

  listingsContainer.classList.add('px-4', 'mb-12');
  listingsContainer.innerHTML = 'Loading auctions...';

  if (newListingBtn && localStorage.getItem('token')) {
    newListingBtn.classList.remove('hidden');
    newListingBtn.addEventListener('click', openCreateListingModal);
  }

  // Start with page 1
  await loadListings(currentPage);

  // Set up the Load More button
  initLoadMoreButton();

  // If you want infinite scroll as well, add it here

  // Login modal logic
  if (profileBtn && modal && backdrop && closeModalBtn) {
    if (!localStorage.getItem('token')) {
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
      modal.classList.add('hidden');
    }
  }
}

// Category link clicks
categoryLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const selectedCategory = link.dataset.category || 'all';
    console.log('Category changed to:', selectedCategory); // Add this line
    if (!window.location.pathname.includes('/auctions/')) {
      window.location.href = `/auctions/index.html?category=${encodeURIComponent(
        selectedCategory
      )}`;
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

// Kick off auctions logic
initAuctionsPage();

/* -------------------------------------------------
   CREATE LISTING MODAL LOGIC
--------------------------------------------------- */
function openCreateListingModal() {
  if (!createListingModal) return;
  createListingModal.classList.remove('hidden');
  createListingModal.setAttribute('aria-hidden', 'false');
}

// Close the create listing modal on "X" or backdrop
if (closeCreateListingBtn && createListingBackdrop) {
  closeCreateListingBtn.addEventListener('click', closeCreateListingModal);
  createListingBackdrop.addEventListener('click', closeCreateListingModal);
}

function closeCreateListingModal() {
  if (!createListingModal) return;
  createListingModal.classList.add('hidden');
  createListingModal.setAttribute('aria-hidden', 'true');
}

// Handle create listing form submission
if (createListingForm) {
  createListingForm.addEventListener('submit', onCreateListingSubmit);
}

async function onCreateListingSubmit(event) {
  event.preventDefault();

  const titleInput = document.getElementById('listing-title');
  const descInput = document.getElementById('listing-description');
  const tagsInput = document.getElementById('listing-tags');
  const mediaInput = document.getElementById('listing-media');
  const endsAtInput = document.getElementById('listing-endsAt');

  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const tags = tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag);
  const mediaUrl = mediaInput.value.trim();
  const endsAtRaw = endsAtInput.value;
  const endsAt = new Date(endsAtRaw).toISOString();

  if (!title || !endsAt) {
    alert('Title and End Date/Time are required.');
    return;
  }

  let media = [];
  if (mediaUrl) {
    media = [{ url: mediaUrl, alt: title || 'Listing image' }];
  }

  console.log("Creating listing with data:", { title, description, tags, media, endsAt });

  try {
    const response = await createListing({
      title,
      description,
      tags,
      media,
      endsAt,
    });

    let newListing = response;
    console.log("Create listing response:", newListing);

    alert(`Listing created with ID: ${newListing.id}`);

    if (!newListing.created) {
      newListing.created = new Date().toISOString();
    }
    if (!newListing.tags || newListing.tags.length === 0) {
      newListing.tags = tags;
    }

    allAuctions.unshift(newListing);
    applyFilterAndSort();

    // Close modal
    closeCreateListingModal();
  } catch (error) {
    console.error('Failed to create listing:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    alert('Creation failed. Check console for details.');
  }
}

/* -------------------------------------------------
   UPDATE LISTING MODAL LOGIC
--------------------------------------------------- */
// Close the update listing modal on "X" or backdrop
if (closeUpdateListingBtn && updateListingBackdrop) {
  closeUpdateListingBtn.addEventListener('click', closeUpdateListingModal);
  updateListingBackdrop.addEventListener('click', closeUpdateListingModal);
}

function closeUpdateListingModal() {
  if (!updateListingModal) return;
  updateListingModal.classList.add('hidden');
  updateListingModal.setAttribute('aria-hidden', 'true');
}

// Handle update listing form submission
if (updateListingForm) {
  updateListingForm.addEventListener('submit', onUpdateListingSubmit);
}

async function onUpdateListingSubmit(event) {
  event.preventDefault();

  // Grab listing ID from modal's dataset
  const listingId = updateListingModal?.dataset?.listingId;
  if (!listingId) {
    alert('No listing ID found for update.');
    return;
  }

  const titleInput = document.getElementById('update-listing-title');
  const descInput = document.getElementById('update-listing-description');
  const tagsInput = document.getElementById('update-listing-tags');
  const mediaInput = document.getElementById('update-listing-media');
  const endsAtInput = document.getElementById('update-listing-endsAt');

  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const tags = tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag);
  const mediaUrl = mediaInput.value.trim();
  const endsAtRaw = endsAtInput.value;
  const endsAt = new Date(endsAtRaw).toISOString();

  if (!title || !endsAt) {
    alert('Title and End Date/Time are required.');
    return;
  }

  let media = [];
  if (mediaUrl) {
    media = [{ url: mediaUrl, alt: title || 'Listing image' }];
  }

  console.log("Updating listing with data:", { title, description, tags, media, endsAt });

  try {
    await updateListing(listingId, { title, description, tags, media, endsAt });
    alert('Listing updated!');

    // Refresh
    allAuctions = [];
    currentPage = 1;
    hasMore = true;
    listingsContainer.innerHTML = 'Loading auctions...';
    await loadListings(currentPage);

    // Close modal
    closeUpdateListingModal();
  } catch (error) {
    console.error('Failed to update listing:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    alert('Update failed. Check console for details.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('search')?.trim()?.toLowerCase() || '';

  if (searchQuery) {
    if (allAuctions.length) {
      let filtered = allAuctions.filter((item) =>
        item.title.toLowerCase().includes(searchQuery)
      );
      renderListings(filtered);
    }
  }
});
