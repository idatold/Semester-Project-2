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

function createSingleListingLayout(listing) {
  // Outer container for the back link + card
  const outerContainer = document.createElement('div');
  outerContainer.className = 'flex flex-col items-center px-4';
  
  // Back link row
  const backLinkRow = document.createElement('div');
  backLinkRow.className = 'w-full max-w-4xl mb-6 text-center';
  const backLink = document.createElement('a');
  backLink.href = '/auctions/index.html';
  backLink.className = 'text-lg underline text-gray-600';
  backLink.textContent = '← Back to all auctions';
  backLinkRow.appendChild(backLink);
  outerContainer.appendChild(backLinkRow);
  
  // The listing card
  const cardEl = createSingleListingDOM(listing);
  outerContainer.appendChild(cardEl);
  
  return outerContainer;
}

function createSingleListingDOM(listing) {
  const { title, description, media, created, endsAt, bids, seller, tags } = listing;
  const card = document.createElement('div');
  card.className = 'bg-white shadow-md rounded p-6 flex flex-col items-center w-full max-w-[540px] mx-auto font-[Beiruti]';
  
  // 1) Image container (matches mainAuctions fallback pattern)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'mb-4 w-full max-w-[500px] flex items-center justify-center';
  imageContainer.style.aspectRatio = '500 / 333';

  // Build like in mainAuctions: <div style bg> + <img> with error->background swap
  const mediaDiv = document.createElement('div');
  mediaDiv.className = 'listing-media w-full h-full flex items-center justify-center p-0';
  mediaDiv.style.width = '100%';
  mediaDiv.style.height = '100%';
  mediaDiv.style.backgroundSize = 'cover';
  mediaDiv.style.backgroundPosition = 'center';
  mediaDiv.style.backgroundRepeat = 'no-repeat';

  const imgEl = document.createElement('img');
  const mediaUrl = media?.[0]?.url || '';
  const mediaAlt = media?.[0]?.alt || title || 'Auction image';
  const fallbackBg = '/bidhivenoimage.jpg'; // SAME path as in mainAuctions (works locally)

  // keep track of what to open in modal
  let currentImageForModal = mediaUrl || fallbackBg;

  imgEl.src = mediaUrl || ''; // if empty, we'll hide and set bg below
  imgEl.alt = mediaAlt;
  imgEl.className = 'auction-img object-cover w-full h-full rounded cursor-pointer';
  imgEl.loading = 'lazy';
  imgEl.decoding = 'async';

  // ERROR → hide <img>, set background to fallback (no loop), update modal src
  imgEl.addEventListener('error', () => {
    if (imgEl.dataset.fallbackApplied) return;
    imgEl.dataset.fallbackApplied = '1';
    imgEl.style.display = 'none';
    mediaDiv.style.backgroundImage = `url('${fallbackBg}')`;
    mediaDiv.style.backgroundColor = '#ffffff';
    currentImageForModal = fallbackBg;
  });

  // If there was no URL at all, immediately use fallback background
  if (!mediaUrl) {
    imgEl.style.display = 'none';
    mediaDiv.style.backgroundImage = `url('${fallbackBg}')`;
    mediaDiv.style.backgroundColor = '#ffffff';
    currentImageForModal = fallbackBg;
  }

  // Click to open the image (original or fallback) in modal
  mediaDiv.addEventListener('click', () => openImageModal(currentImageForModal));
  imgEl.addEventListener('click', (e) => {
    e.stopPropagation();
    openImageModal(currentImageForModal);
  });

  mediaDiv.appendChild(imgEl);
  imageContainer.appendChild(mediaDiv);
  card.appendChild(imageContainer);
  
  // 2) Title
  const titleEl = document.createElement('h2');
  titleEl.textContent = title || 'Untitled';
  titleEl.className = 'text-2xl font-bold mb-6';
  titleEl.style.fontFamily = 'The seasons, sans-serif';
  card.appendChild(titleEl);
  
  // 3) Seller + Avatar + Tags container
  const sellerTagsContainer = document.createElement('div');
  sellerTagsContainer.className = 'flex flex-col items-center mb-6 w-full';
  // 3a) Hex-shaped avatar (clickable to profile page)
  const avatarUrl = seller?.avatar?.url || 'https://via.placeholder.com/50';
  const avatarEl = document.createElement('img');
  avatarEl.src = avatarUrl;
  avatarEl.alt = 'Seller avatar';
  avatarEl.style.width = '50px';
  avatarEl.style.height = '50px';
  avatarEl.style.objectFit = 'cover';
  avatarEl.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  avatarEl.style.marginBottom = '8px';
  // Make avatar clickable to go to the seller's profile page
  avatarEl.style.cursor = 'pointer';
  avatarEl.addEventListener('click', () => {
    // Assuming the seller object has an id or username to form a URL:
    const sellerId = seller?.id || '';
    window.location.href = `/profile/index.html?id=${sellerId}`;
  });
  sellerTagsContainer.appendChild(avatarEl);
  
  // 3b) Seller name
  const sellerName = seller?.name || 'Unknown Seller';
  const sellerEl = document.createElement('p');
  sellerEl.className = 'text-xl text-gray-600 mb-1 text-center';
  sellerEl.textContent = `by ${sellerName}`;
  sellerTagsContainer.appendChild(sellerEl);
  
  // 3c) Tags
  const tagsText = (Array.isArray(tags) && tags.length > 0) ? tags.join(', ') : 'No tags';
  const tagsEl = document.createElement('p');
  tagsEl.style.color = '#9B7E47';
  tagsEl.className = 'text-center';
  tagsEl.textContent = tagsText;
  sellerTagsContainer.appendChild(tagsEl);
  card.appendChild(sellerTagsContainer);
  
  // 4) Description
  const descEl = document.createElement('p');
  descEl.className = 'text-gray-700 text-xl mt-8 w-full';
  descEl.style.textAlign = 'left';
  descEl.textContent = description || 'No description provided.';
  card.appendChild(descEl);
  
  // 5) Info row for Created/Ends
  const infoRow = document.createElement('div');
  infoRow.className = 'flex justify-between w-full text-xl text-gray-500 my-4';
  const createdLocal = formatDateWithBreak(created);
  const endsLocal = formatDateWithBreak(endsAt);
  const createdSpan = document.createElement('span');
  createdSpan.innerHTML = `Created:<br>${createdLocal}`;
  createdSpan.className = 'text-left';
  const endsSpan = document.createElement('span');
  endsSpan.innerHTML = `Ends:<br>${endsLocal}`;
  endsSpan.className = 'text-left';
  infoRow.appendChild(createdSpan);
  infoRow.appendChild(endsSpan);
  card.appendChild(infoRow);
  
  // 6) Bidding area
  const token = localStorage.getItem('token');
  if (token) {
    const bidContainer = document.createElement('div');
    bidContainer.className = 'flex flex-col w-full mb-4 text-center text-xl';
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
    btnEl.className = 'bg-[#9B7E47] hover:bg-[#866C3C] text-white px-4 py-2 rounded-b transition relative z-10 mb-8';
    bidContainer.appendChild(inputEl);
    bidContainer.appendChild(btnEl);
    card.appendChild(bidContainer);
    btnEl.addEventListener('click', handleBid);
  } else {
    const note = document.createElement('p');
    note.className = 'text-xl text-gray-500 w-full text-center';
    note.textContent = 'Log in to place a bid.';
    card.appendChild(note);
  }
  
  // 7) Bid History
  const bidHistoryDiv = document.createElement('div');
  bidHistoryDiv.className = 'border-t pt-4 w-full';
  const bidTitle = document.createElement('h3');
  bidTitle.className = 'text-xl font-bold mb-2 text-left';
  bidTitle.textContent = 'Bid History';
  bidHistoryDiv.appendChild(bidTitle);
  const ulEl = document.createElement('ul');
  ulEl.className = 'text-left';
  if (bids && bids.length > 0) {
    const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
    sortedBids.forEach(bid => {
      const liEl = document.createElement('li');
      liEl.className = 'flex w-full text-xl py-2 border-b last:border-0';
      liEl.style.fontWeight = 'normal';
      const bidderSpan = document.createElement('span');
      bidderSpan.className = 'w-1/3 text-left';
      bidderSpan.textContent = bid.bidder?.name || 'Unknown';
      const amountSpan = document.createElement('span');
      amountSpan.className = 'w-1/3 text-center';
      amountSpan.textContent = bid.amount;
      const dateSpan = document.createElement('span');
      dateSpan.className = 'w-1/3 text-right';
      dateSpan.textContent = formatDateNoBreak(bid.created);
      liEl.appendChild(bidderSpan);
      liEl.appendChild(amountSpan);
      liEl.appendChild(dateSpan);
      ulEl.appendChild(liEl);
    });
  } else {
    const noBidsLi = document.createElement('li');
    noBidsLi.className = 'text-xl text-gray-500 text-left';
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

async function handleBid() {
  try {
    const amountInput = document.getElementById('bid-amount');
    const amount = Number(amountInput.value);
    if (!amount || amount < 1) {
      alert('Please enter a valid bid amount.');
      return;
    }
    console.log('Placing bid on listing:', listingId, 'with amount:', amount);
    const bidResponse = await bidOnListing(listingId, amount);
    console.log('Bid response:', bidResponse);
    if (bidResponse) {
      alert('Bid placed successfully!');
      window.location.reload();
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

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  
  // Desktop elements
  const profileBtn = document.getElementById('profile-btn'); // SVG modal trigger
  const profileDropdown = document.getElementById('profile-dropdown');
  const desktopProfileLink = document.getElementById('desktop-profile-link');
  
  // Mobile elements
  const mobileAuthBtn = document.getElementById('mobile-auth-btn');
  const mobileProfileLink = document.getElementById('mobile-profile-link');
  
  if (token) {
    if (desktopProfileLink) desktopProfileLink.classList.remove('hidden');
    if (mobileAuthBtn) mobileAuthBtn.textContent = 'Log Out';
    if (mobileProfileLink) mobileProfileLink.classList.remove('hidden');
    if (mobileAuthBtn) {
      mobileAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      });
    }
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      });
    }
  } else {
    if (desktopProfileLink) desktopProfileLink.classList.add('hidden');
    if (mobileAuthBtn) mobileAuthBtn.textContent = 'Login';
    if (mobileProfileLink) mobileProfileLink.classList.add('hidden');
  }
});
