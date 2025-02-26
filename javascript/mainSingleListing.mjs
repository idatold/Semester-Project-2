import './main.mjs'; // shared nav toggles, etc.
import { getSingleListing, bidOnListing } from '../javascript/api/listings.mjs';
import { formatDateWithBreak, formatDateNoBreak } from './api/dateFormatter.mjs';

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
    const singleListingEl = createSingleListingDOM(listing);
    container.appendChild(singleListingEl);

  } catch (error) {
    console.error('Failed to load single listing:', error);
    container.innerHTML = '<p>Could not load listing.</p>';
  }
}

/**
 * Create DOM elements for the single listing
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

  // 1) Outer container (like a "card")
  const card = document.createElement('div');
  card.className = 'bg-white shadow-md rounded p-6 flex flex-col items-center';
  // We want most text in Beiruti except the title
  card.style.fontFamily = 'Beiruti'; 

  // 2) Back link
  const backLink = document.createElement('a');
  backLink.href = '/auctions/index.html';
  backLink.className = 'text-m underline text-gray-600 inline-block self-start mb-4';
  backLink.textContent = '← Back to all auctions';
  card.appendChild(backLink);

  // 3) Image container (600×400)
  const imageContainer = document.createElement('div');
  imageContainer.style.width = '600px';
  imageContainer.style.height = '400px';
  imageContainer.style.display = 'flex';
  imageContainer.style.justifyContent = 'center';
  imageContainer.style.alignItems = 'center';
  imageContainer.className = 'mb-4';

  const imageUrl = media?.[0]?.url || 'https://via.placeholder.com/600x400';
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

  // 4) Title
  const titleEl = document.createElement('h2');
  titleEl.textContent = title || 'Untitled';
  titleEl.className = 'text-2xl font-bold mb-1';
  // Different font for the title (if you have a heading font)
  titleEl.style.fontFamily = 'The seasons, sans-serif'; 
  card.appendChild(titleEl);

  // 5) Seller name
  const sellerName = seller?.name || 'Unknown Seller';
  const sellerEl = document.createElement('p');
  sellerEl.className = 'text-xl text-gray-600 mb-2';
  sellerEl.textContent = `by ${sellerName}`;
  card.appendChild(sellerEl);

  // 6) Tags in #9B7E47
  const tagsText = (Array.isArray(tags) && tags.length > 0) ? tags.join(', ') : 'No tags';
  const tagsEl = document.createElement('p');
  tagsEl.style.color = '#9B7E47';
  tagsEl.className = 'mb-6';
  tagsEl.textContent = tagsText;
  card.appendChild(tagsEl);

  // 7) Description
  const descEl = document.createElement('p');
  descEl.className = 'text-gray-700 text-xl mb-4';
  descEl.textContent = description || 'No description provided.';
  card.appendChild(descEl);

  // 8) Info row for Created/Ends
  const infoRow = document.createElement('div');
  infoRow.className = 'flex justify-between w-full text-lg text-gray-500 mb-4';

  const createdLocal = formatDateWithBreak(created);
  const endsLocal = formatDateWithBreak(endsAt);

  const createdSpan = document.createElement('span');
  createdSpan.innerHTML = `Created:<br>${createdLocal}`;

  const endsSpan = document.createElement('span');
  endsSpan.innerHTML = `Ends:<br>${endsLocal}`;

  infoRow.appendChild(createdSpan);
  infoRow.appendChild(endsSpan);
  card.appendChild(infoRow);

  // 9) Bidding area
  const token = localStorage.getItem('token');
  if (token) {
    // Show the place bid input + button
    const bidContainer = document.createElement('div');
    bidContainer.className = 'flex flex-col items-center w-full mb-4';

    const rowDiv = document.createElement('div');
    rowDiv.className = 'flex items-center';

    const inputEl = document.createElement('input');
    inputEl.type = 'number';
    inputEl.id = 'bid-amount';
    inputEl.className = 'border border-yellow-700 rounded-l px-3 py-2 focus:outline-none';
    inputEl.placeholder = 'Your bid';
    inputEl.min = '1';

    const btnEl = document.createElement('button');
    btnEl.id = 'place-bid-btn';
    btnEl.textContent = 'Place Bid';
    btnEl.className = 'bg-[#9B7E47] hover:bg-[#866C3C] text-white px-4 py-2 rounded-r transition relative z-10';

    rowDiv.appendChild(inputEl);
    rowDiv.appendChild(btnEl);
    bidContainer.appendChild(rowDiv);
    card.appendChild(bidContainer);

    // The event for placing a bid is in handleBid
    btnEl.addEventListener('click', handleBid);

  } else {
    // Show a note if not logged in
    const note = document.createElement('p');
    note.className = 'text-m text-gray-500';
    note.textContent = 'Log in to place a bid.';
    card.appendChild(note);
  }

  // 10) Bid History
  const bidHistoryDiv = document.createElement('div');
  bidHistoryDiv.className = 'border-t pt-4 w-full';

  const bidTitle = document.createElement('h3');
  bidTitle.className = 'text-lg font-bold mb-2';
  bidTitle.textContent = 'Bid History';

  bidHistoryDiv.appendChild(bidTitle);

  const ulEl = document.createElement('ul');

  if (bids && bids.length > 0) {
    bids.forEach(bid => {
      const liEl = document.createElement('li');
      liEl.className = 'flex justify-between items-center text-sm py-2 border-b last:border-0';

      const amountSpan = document.createElement('span');
      amountSpan.className = 'font-bold text-xl text-gray-800';
      amountSpan.textContent = bid.amount;

      const bidderSpan = document.createElement('span');
      bidderSpan.className = 'text-gray-600';
      bidderSpan.textContent = bid.bidder?.name || 'Unknown';

      const dateSpan = document.createElement('span');
      dateSpan.className = 'text-gray-500';
      dateSpan.textContent = formatDateNoBreak(bid.created);

      liEl.appendChild(amountSpan);
      liEl.appendChild(bidderSpan);
      liEl.appendChild(dateSpan);

      ulEl.appendChild(liEl);
    });
  } else {
    const noBidsLi = document.createElement('li');
    noBidsLi.className = 'text-sm text-gray-500';
    noBidsLi.textContent = 'No bids yet.';
    ulEl.appendChild(noBidsLi);
  }

  bidHistoryDiv.appendChild(ulEl);
  card.appendChild(bidHistoryDiv);

  // Return the final card
  return card;
}

/**
 * A simple modal for enlarging the image
 */
function openImageModal(imageUrl) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';

  // Big image
  const bigImage = document.createElement('img');
  bigImage.src = imageUrl;
  bigImage.className = 'rounded shadow-lg cursor-pointer';
  bigImage.style.maxWidth = '80vw';
  bigImage.style.maxHeight = '80vh';
  bigImage.style.objectFit = 'contain';

  overlay.appendChild(bigImage);
  document.body.appendChild(overlay);

  // Close modal on overlay click
  overlay.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  // Stop click on bigImage from closing
  bigImage.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

/**
 * The handleBid function (re-used in createSingleListingDOM)
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

      // Rebuild the DOM with the updated listing
      container.innerHTML = '';
      const newCard = createSingleListingDOM(updatedListing);
      container.appendChild(newCard);

    } else {
      alert('Bid placed, but no updated data returned.');
    }

  } catch (error) {
    console.error('Failed to place bid:', error);
    alert('Error placing bid. Check console for details.');
  }
}

// Finally, call loadListing
loadListing();
