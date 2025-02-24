import './main.mjs'; // Shared nav toggles, etc.
import { getSingleListing, bidOnListing } from '../javascript/api/listings.mjs';

// 1) Grab container + parse the listing ID
const container = document.getElementById('listing-container');
const params = new URLSearchParams(window.location.search);
const listingId = params.get('id');

/**
 * Load the single listing
 */
async function loadListing() {
  if (!listingId) {
    container.innerHTML = '<p>No listing ID provided.</p>';
    return;
  }

  try {
    container.innerHTML = '<p>Loading listing...</p>';

    // If API returns { data: {...}, meta: {...} }, you may do:
    const listingResponse = await getSingleListing(listingId, { seller: true, bids: true });
    // Adjust if needed
    const listing = listingResponse.data; 

    renderListing(listing);
  } catch (error) {
    console.error('Failed to load single listing:', error);
    container.innerHTML = '<p>Could not load listing.</p>';
  }
}

/**
 * Render the listing details (no "1000 credits" placeholder)
 */
function renderListing(listing) {
  const {
    title,
    description,
    media,
    created,
    endsAt,
    bids,
  } = listing;

  // Check if user is logged in
  const token = localStorage.getItem('token');

  // If logged in, show bid input & button; otherwise show a note
  let placeBidHTML = '';
  if (token) {
    placeBidHTML = `
      <div class="flex items-center">
        <input
          type="number"
          id="bid-amount"
          class="border border-gray-300 rounded-l px-3 py-2 focus:outline-none"
          placeholder="Your bid"
          min="1"
        />
        <button
          id="place-bid-btn"
          class="bg-[#9B7E47] hover:bg-[#866C3C] text-white px-4 py-2 rounded-r transition"
        >
          Place Bid
        </button>
      </div>
    `;
  } else {
    placeBidHTML = `<p class="text-sm text-gray-500">Log in to place a bid.</p>`;
  }

  // The first media image or fallback
  const imageUrl = media?.[0]?.url || 'https://via.placeholder.com/400x300';

  container.innerHTML = `
    <!-- "Back to all auctions" link -->
    <a
      href="/auctions/index.html"
      class="text-sm underline text-gray-600 inline-block mb-4"
    >
      &larr; Back to all auctions
    </a>

    <!-- Main Card -->
    <div class="max-w-xl mx-auto bg-white shadow-md rounded p-6 flex flex-col items-center">

      <!-- Listing Image -->
      <img
        src="${imageUrl}"
        alt="${title}"
        class="w-full h-auto object-cover rounded mb-4"
      />

      <!-- Title & placeholder category -->
      <h2 class="text-2xl font-bold mb-1">${title || 'Untitled'}</h2>
      <p class="text-gray-500 mb-4">Vintage</p>

      <!-- Description -->
      <p class="text-gray-700 mb-4 text-center">
        ${description || 'No description provided.'}
      </p>

      <!-- Listing info row -->
      <div class="flex justify-between w-full text-sm text-gray-500 mb-4">
        <span>Created: ${created || 'Unknown'}</span>
        <span>Ends: ${endsAt ? new Date(endsAt).toLocaleDateString() : '???'}</span>
      </div>

      <!-- "Place Bid" area (no 1000 placeholder) -->
      <div class="flex flex-col items-center w-full mb-4">
        ${placeBidHTML}
      </div>

      <!-- Bid History -->
      <div class="border-t pt-4 w-full">
        <h3 class="text-xl font-bold mb-2">Bid History</h3>
        <ul>
          ${
            bids && bids.length
              ? bids.map((bid) => `
                <li class="flex justify-between text-sm py-2 border-b last:border-0">
                  <span>${bid.amount}</span>
                  <span>${bid.bidder?.name || 'Unknown'}</span>
                  <span>${new Date(bid.created).toLocaleDateString()}</span>
                </li>
              `).join('')
              : '<li class="text-sm text-gray-500">No bids yet.</li>'
          }
        </ul>
      </div>
    </div>
  `;

  // If logged in, attach an event to the "Place Bid" button
  if (token) {
    const placeBidBtn = document.getElementById('place-bid-btn');
    if (placeBidBtn) {
      placeBidBtn.addEventListener('click', handleBid);
    }
  }
}

/**
 * Handle the bid button click
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

    // Attempt to place the bid
    const updatedListing = await bidOnListing(listingId, amount);
    console.log('Bid response:', updatedListing);

    // If the API returns updated listing data, re-render
    if (updatedListing && updatedListing.data) {
      alert('Bid placed successfully!');
      renderListing(updatedListing.data);
    } else {
      // If the API doesn't return updated data, you might just refresh or show a note
      alert('Bid placed, but no updated data returned.');
    }

  } catch (error) {
    console.error('Failed to place bid:', error);
    alert('Error placing bid. Check console for details.');
  }
}

// Finally, load the listing
loadListing();
