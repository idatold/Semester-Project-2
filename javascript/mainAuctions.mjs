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

/**
 * Render auctions
 */
function renderListings(auctions) {
  listingsContainer.innerHTML = '';

  if (!auctions || auctions.length === 0) {
    listingsContainer.innerHTML = '<p>No auctions found.</p>';
    return;
  }

  // Check if user is logged in
  const token = localStorage.getItem('token');
  let loggedInUsername = null;
  if (token) {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userObj = JSON.parse(userString);
      loggedInUsername = userObj?.data?.name || null;
    }
  }

  auctions.forEach((listing) => {
    const { id, title, description, media, endsAt, bids, seller } = listing;

    // Card container
    const card = document.createElement('div');
    card.className =
      'bg-white shadow-md rounded-lg overflow-hidden flex flex-col max-w-xs w-full h-auto';

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'w-full h-56 flex items-center justify-center p-4';
    const imageUrl = media?.[0]?.url || 'https://fakeimg.pl/600x400?text=??';
    const imageEl = document.createElement('img');
    imageEl.src = imageUrl;
    imageEl.alt = title || 'No title';
    imageEl.className = 'object-cover w-full h-full rounded';
    imageContainer.appendChild(imageEl);
    card.appendChild(imageContainer);

    // Text area
    const textArea = document.createElement('div');
    textArea.className = 'flex flex-col justify-between p-4';
    const textWrapper = document.createElement('div');

    const h2 = document.createElement('h2');
    h2.className = 'text-lg font-bold mb-2';
    h2.textContent = truncateText(title || 'Untitled', 30);

    const descP = document.createElement('p');
    descP.className = 'text-gray-600 mb-2 font-beiruti';
    descP.textContent = truncateText(
      description || 'No description provided.',
      60
    );

    const highestBid = getHighestBid(bids);
    const bidP = document.createElement('p');
    bidP.className = 'font-semibold text-md font-beiruti';
    bidP.textContent = `Current Bid: ${highestBid}`;

    const timeP = document.createElement('p');
    timeP.className = 'text-md text-gray-500 font-beiruti';
    timeP.textContent = `Time remaining: ${getTimeRemaining(endsAt)}`;

    textWrapper.appendChild(h2);
    textWrapper.appendChild(descP);
    textWrapper.appendChild(bidP);
    textWrapper.appendChild(timeP);

    // "View Listing" button
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'mt-4 flex justify-center';
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View Listing';
    viewBtn.className =
      'text-white px-4 py-2 rounded transition text-sm bg-[#9B7E47] hover:bg-[#866C3C]';
    viewBtn.addEventListener('click', () => {
      window.location.href = `/auctions/listing/index.html?id=${id}`;
    });
    buttonWrapper.appendChild(viewBtn);
    textArea.appendChild(textWrapper);
    textArea.appendChild(buttonWrapper);

    // If logged in & user is listing owner => show Update/Delete
    if (loggedInUsername && seller?.name === loggedInUsername) {
      const ownerActions = document.createElement('div');
      ownerActions.className = 'flex justify-around mt-4';

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Update';
      editBtn.className =
        'px-3 py-1 text-sm border border-gray-300 rounded bg-white text-black hover:bg-gray-100 transition';
      editBtn.addEventListener('click', () => openUpdateListingModal(listing));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className =
        'px-3 py-1 text-sm border border-gray-300 rounded bg-white text-black hover:bg-gray-100 transition';
      deleteBtn.addEventListener('click', () => onDeleteListing(id));

      ownerActions.appendChild(editBtn);
      ownerActions.appendChild(deleteBtn);
      textArea.appendChild(ownerActions);
    }

    card.appendChild(textArea);
    listingsContainer.appendChild(card);
  });
}

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

/**
 * Minimal "Delete" listing logic
 */
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

/**
 * Load a specific page of listings with 20 items each
 */
async function loadListings(page) {
  isLoading = true;
  try {
    console.log('Loading page', page);

    // ADDED: limit=20 to fetch 20 per page
    const response = await getAllListings(page, 20);
    console.log('getAllListings response:', response);

    const { data, meta } = response;
    console.log("meta from response:", meta);

    if (page === 1 && listingsContainer.innerHTML === 'Loading auctions...') {
      listingsContainer.innerHTML = '';
    }

    // Append new listings to global array
    data.forEach((listing) => {
      const alreadyExists = allAuctions.some((item) => item.id === listing.id);
      if (!alreadyExists) {
        allAuctions.push(listing);
      }
    });

    applyFilterAndSort();

    // If it's the last page, hide the "Load More" button
    if (meta.isLastPage) {
      hasMore = false;
      const loadMoreBtn = document.getElementById('load-more-btn');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
      }
    }
  } catch (error) {
    console.error(`Failed to load listings for page ${page}:`, error);
  } finally {
    isLoading = false;
  }
}

/**
 * Initialize the auctions page
 */
async function initAuctionsPage() {
  console.log('initAuctionsPage called');

  const params = new URLSearchParams(window.location.search);
  if (params.has('category')) {
    currentCategory = params.get('category');
  }

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
