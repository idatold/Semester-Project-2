// singleListing.mjs

import { getSingleListing } from '../api/listings.mjs'; 


const container = document.getElementById('listing-container');

const params = new URLSearchParams(window.location.search);
const listingId = params.get('id');

/**
 * Load the single listing
 */
async function loadListing() {
  // If no ID is present, show an error
  if (!listingId) {
    container.innerHTML = '<p>No listing ID provided.</p>';
    return;
  }

  try {
    container.innerHTML = '<p>Loading listing...</p>';

    // Fetch the single listing
    // We can add { seller: true, bids: true } if we want extra data
    const listing = await getSingleListing(listingId, { seller: true, bids: true });
    renderListing(listing);
  } catch (error) {
    console.error('Failed to load single listing:', error);
    container.innerHTML = '<p>Could not load listing.</p>';
  }
}

/**
 * Render the listing details
 */
function renderListing(listing) {
  // Destructure what you need
  const { title, description, media, seller, bids, endsAt } = listing;

  // Build some HTML
  // If your listing object is shaped like { data: {...}, meta: {...} }
  // you may need listing.data.title, etc. depending on how your API returns it
  container.innerHTML = `
    <h1 class="text-3xl font-bold mb-4">${title}</h1>
    <img
      src="${media?.[0]?.url || 'https://via.placeholder.com/400x300'}"
      alt="${title}"
      class="w-full max-w-xl h-auto object-cover mb-4"
    >
    <p class="mb-4">${description || 'No description provided.'}</p>
    <p class="font-semibold">Ends at: ${new Date(endsAt).toLocaleString()}</p>
    <p>Seller: ${seller?.name || 'Unknown'}</p>
    <p>Bids so far: ${bids?.length || 0}</p>
  `;

  // If you want to show the list of bids:
  if (bids && bids.length) {
    const bidsList = document.createElement('ul');
    bidsList.className = 'mt-4';

    bids.forEach((bid) => {
      const li = document.createElement('li');
      li.textContent = `Bid of ${bid.amount} by ${bid.bidder?.name || 'Unknown'} on ${new Date(bid.created).toLocaleString()}`;
      bidsList.appendChild(li);
    });

    container.appendChild(bidsList);
  }
}

// Call the loader
loadListing();
