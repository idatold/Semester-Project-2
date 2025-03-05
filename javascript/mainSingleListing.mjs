// File: /javascript/mainSingleListings.mjs
import './main.mjs'; // shared nav toggles, dropdowns, etc.
import { getSingleListing, bidOnListing } from '../javascript/api/listings.mjs';
import { formatDateWithBreak, formatDateNoBreak } from './api/dateFormatter.mjs';
import { updateCredits } from './api/profile.mjs';
import { initProfileModal } from './loginAndRegisterModal.mjs';

document.addEventListener('DOMContentLoaded', () => {
  initProfileModal();
});



// Update credits on page load.
updateCredits();

// The container in your listing HTML
const container = document.getElementById('listing-container');

// Parse the listing ID from ?id=...
const params = new URLSearchParams(window.location.search);
const listingId = params.get('id');

/**
 * Load and display the single listing
 */
async function loadListing() {
  if (!listingId) {
    container.innerHTML = '<p>No listing ID provided.</p>';
    return;
  }

  try {
    container.innerHTML = '<p>Loading listing...</p>';

    const listing = await getSingleListing(listingId, { seller: true, bids: true });
    console.log('Single listing object:', listing);

    if (!listing) {
      container.innerHTML = '<p>No listing found or an error occurred.</p>';
      return;
    }

    // Clear out "Loading..." text
    container.innerHTML = '';

    // Build the DOM-based layout
    const layoutEl = createSingleListingLayout(listing);
    container.appendChild(layoutEl);

  } catch (error) {
    console.error('Failed to load single listing:', error);
    container.innerHTML = '<p>Could not load listing.</p>';
  }
}

/**
 * Create an overall layout with:
 * 1) A back link row (left-aligned)
 * 2) A card that is wider than 500px to accommodate a 500×333 image
 */
function createSingleListingLayout(listing) {
  // 1) Outer container for the back link + card
  const outerContainer = document.createElement('div');
  outerContainer.className = 'flex flex-col items-center';

  // 2) Back link row
  const backLinkRow = document.createElement('div');
  backLinkRow.className = 'w-full max-w-4xl px-4 mb-6';
  backLinkRow.style.textAlign = 'center';

  const backLink = document.createElement('a');
  backLink.href = '/auctions/index.html';
  backLink.className = 'text-lg underline text-gray-600';
  backLink.textContent = '← Back to all auctions';

  backLinkRow.appendChild(backLink);
  outerContainer.appendChild(backLinkRow);

  // 3) The actual listing card
  const cardEl = createSingleListingDOM(listing);
  outerContainer.appendChild(cardEl);

  return outerContainer;
}

/**
 * Create DOM elements for the single listing card
 */
function createSingleListingDOM(listing) {
  const {
    title,
    description,
    media,
    created,
    endsAt,
    bids,
    seller,
    tags,
  } = listing;

  const card = document.createElement('div');
  card.className = 'bg-white shadow-md rounded p-6 flex flex-col items-center';
  card.style.width = '540px';
  card.style.margin = '0 auto';
  card.style.fontFamily = 'Beiruti'; 

  // 1) Image container (500×333)
  const imageContainer = document.createElement('div');
  imageContainer.style.width = '500px';
  imageContainer.style.height = '333px';
  imageContainer.style.display = 'flex';
  imageContainer.style.justifyContent = 'center';
  imageContainer.style.alignItems = 'center';
  imageContainer.className = 'mb-4';

  const imageUrl = media?.[0]?.url || 'https://via.placeholder.com/500x333';
  const imageEl = document.createElement('img');
  imageEl.src = imageUrl;
  imageEl.alt = title || 'Untitled';
  imageEl.style.width = '100%';
  imageEl.style.height = '100%';
  imageEl.style.objectFit = 'cover';
  imageEl.className = 'rounded cursor-pointer';

  // On click => enlarge modal
  imageEl.addEventListener('click', () => openImageModal(imageUrl));

  imageContainer.appendChild(imageEl);
  card.appendChild(imageContainer);

  // 2) Title
  const titleEl = document.createElement('h2');
  titleEl.textContent = title || 'Untitled';
  titleEl.className = 'text-2xl font-bold mb-6';
  titleEl.style.fontFamily = 'The seasons, sans-serif';
  card.appendChild(titleEl);

  // 3) Seller + Avatar + Tags container (centered)
  const sellerTagsContainer = document.createElement('div');
  sellerTagsContainer.className = 'flex flex-col items-center mb-6 w-full';

  // 3a) Hex-shaped avatar
  const avatarUrl = seller?.avatar?.url || 'https://via.placeholder.com/50';
  const avatarEl = document.createElement('img');
  avatarEl.src = avatarUrl;
  avatarEl.alt = 'Seller avatar';
  avatarEl.style.width = '50px';
  avatarEl.style.height = '50px';
  avatarEl.style.objectFit = 'cover';
  avatarEl.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  avatarEl.style.marginBottom = '8px';

  sellerTagsContainer.appendChild(avatarEl);

  // 3b) Seller name (centered)
  const sellerName = seller?.name || 'Unknown Seller';
  const sellerEl = document.createElement('p');
  sellerEl.className = 'text-xl text-gray-600 mb-1';
  sellerEl.style.textAlign = 'center';
  sellerEl.textContent = `by ${sellerName}`;
  sellerTagsContainer.appendChild(sellerEl);

  // 3c) Tags in #9B7E47 (centered)
  const tagsText = (Array.isArray(tags) && tags.length > 0) ? tags.join(', ') : 'No tags';
  const tagsEl = document.createElement('p');
  tagsEl.style.color = '#9B7E47';
  tagsEl.style.textAlign = 'center';
  tagsEl.textContent = tagsText;
  sellerTagsContainer.appendChild(tagsEl);

  card.appendChild(sellerTagsContainer);

  // 4) Description (left-aligned, text-xl)
  const descEl = document.createElement('p');
  descEl.className = 'text-gray-700 text-xl mt-8 w-full';
  descEl.style.textAlign = 'left';
  descEl.textContent = description || 'No description provided.';
  card.appendChild(descEl);

  // 5) Info row for Created/Ends
  const infoRow = document.createElement('div');
  infoRow.className = 'flex justify-between w-full text-xl text-gray-500 mb-4';

  const createdLocal = formatDateWithBreak(created);
  const endsLocal = formatDateWithBreak(endsAt);

  const createdSpan = document.createElement('span');
  createdSpan.innerHTML = `Created:<br>${createdLocal}`;
  createdSpan.style.textAlign = 'left';
  createdSpan.className = 'mb-16 mt-16';

  const endsSpan = document.createElement('span');
  endsSpan.innerHTML = `Ends:<br>${endsLocal}`;
  endsSpan.style.textAlign = 'left';
  endsSpan.className = 'mb-16 mt-16';

  infoRow.appendChild(createdSpan);
  infoRow.appendChild(endsSpan);
  card.appendChild(infoRow);

  // 6) Bidding area
  const token = localStorage.getItem('token');
  if (token) {
    // Show the place bid input + button
    const bidContainer = document.createElement('div');
    bidContainer.className = 'flex flex-col w-full mb-4';
    bidContainer.style.fontSize = '1.25rem';
    bidContainer.style.fontWeight = 'normal';
    bidContainer.style.textAlign = 'center';

    const inputEl = document.createElement('input');
    inputEl.type = 'number';
    inputEl.id = 'bid-amount';
    inputEl.className = 'border border-yellow-700 rounded-t px-3 py-2 focus:outline-none';
    inputEl.placeholder = 'Your bid';
    inputEl.min = '1';
    inputEl.style.marginBottom = '6px';

    const btnEl = document.createElement('button');
    btnEl.id = 'place-bid-btn';
    btnEl.textContent = 'Place Bid';
    btnEl.className = 'bg-[#9B7E47] hover:bg-[#866C3C] mb-32 text-white px-4 py-2 rounded-b transition relative z-10';

    bidContainer.appendChild(inputEl);
    bidContainer.appendChild(btnEl);
    card.appendChild(bidContainer);

    // The event for placing a bid is in handleBid
    btnEl.addEventListener('click', handleBid);

  } else {
    // Show a note if not logged in
    const note = document.createElement('p');
    note.className = 'text-xl text-gray-500 w-full';
    note.style.textAlign = 'center';
    note.textContent = 'Log in to place a bid.';
    card.appendChild(note);
  }

  // 7) Bid History
  const bidHistoryDiv = document.createElement('div');
  bidHistoryDiv.className = 'border-t pt-4 w-full';

  const bidTitle = document.createElement('h3');
  bidTitle.className = 'text-xl font-bold mb-2';
  bidTitle.style.textAlign = 'left';
  bidTitle.textContent = 'Bid History';

  bidHistoryDiv.appendChild(bidTitle);

  const ulEl = document.createElement('ul');
  ulEl.style.textAlign = 'left';

  if (bids && bids.length > 0) {
    // Sort bids descending by amount
    const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);

    sortedBids.forEach(bid => {
      const liEl = document.createElement('li');
      liEl.className = 'flex w-full text-xl py-2 border-b last:border-0';
      liEl.style.fontWeight = 'normal';

      const bidderSpan = document.createElement('span');
      bidderSpan.style.width = '33%';
      bidderSpan.style.textAlign = 'left';
      bidderSpan.textContent = bid.bidder?.name || 'Unknown';

      const amountSpan = document.createElement('span');
      amountSpan.style.width = '33%';
      amountSpan.style.textAlign = 'center';
      amountSpan.textContent = bid.amount;

      const dateSpan = document.createElement('span');
      dateSpan.style.width = '33%';
      dateSpan.style.textAlign = 'right';
      dateSpan.textContent = formatDateNoBreak(bid.created);

      liEl.appendChild(bidderSpan);
      liEl.appendChild(amountSpan);
      liEl.appendChild(dateSpan);

      ulEl.appendChild(liEl);
    });
  } else {
    const noBidsLi = document.createElement('li');
    noBidsLi.className = 'text-xl text-gray-500';
    noBidsLi.style.textAlign = 'left';
    noBidsLi.textContent = 'No bids yet.';
    ulEl.appendChild(noBidsLi);
  }

  bidHistoryDiv.appendChild(ulEl);
  card.appendChild(bidHistoryDiv);

  return card;
}

/**
 * A simple modal for enlarging the image
 */
function openImageModal(imageUrl) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';

  const bigImage = document.createElement('img');
  bigImage.src = imageUrl;
  bigImage.className = 'rounded shadow-lg cursor-pointer';
  bigImage.style.maxWidth = '80vw';
  bigImage.style.maxHeight = '80vh';
  bigImage.style.objectFit = 'contain';

  overlay.appendChild(bigImage);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  bigImage.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

/**
 * The handleBid function
 */
async function handleBid() {
  try {
    const amountInput = document.getElementById('bid-amount');
    const amount = Number(amountInput.value);

    if (!amount || amount < 1) {
      alert('Please enter a valid bid amount.');
      return;
    }

    console.log('Placing bid on listing:', listingId, 'with amount:', amount);
    const updatedListing = await bidOnListing(listingId, amount);
    console.log('Bid response:', updatedListing);

    if (updatedListing) {
      alert('Bid placed successfully!');
      container.innerHTML = '';
      const newLayout = createSingleListingLayout(updatedListing);
      container.appendChild(newLayout);
    } else {
      alert('Bid placed, but no updated data returned.');
    }
  } catch (error) {
    console.error('Failed to place bid:', error);
    alert('Error placing bid. Check console for details.');
  }
}

// Kick off by loading the listing.
loadListing();
