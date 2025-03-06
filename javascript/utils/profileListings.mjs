// File: /javascript/utils/profileListings.mjs
import api from '../api/axios.mjs';

// Modified initProfileListings function
export async function initProfileListings(username) {
  await Promise.all([
    renderProfileSection({
      endpoint: `/auction/profiles/${username}/listings?_active=true`,
      containerId: 'my-listings-container',
      fallbackText: 'No active listings found'
    }),
    renderProfileSection({
      endpoint: `/auction/profiles/${username}/wins`,
      containerId: 'my-wins-container',
      fallbackText: 'No wins yet'
    }),
    renderProfileSection({
      endpoint: `/auction/profiles/${username}/bids?_listings=true&_bids=true`,
      containerId: 'my-bids-container',
      fallbackText: 'No active bids',
      isBidSection: true // New flag for bids
    })
  ]);
}

async function renderProfileSection({ endpoint, containerId, fallbackText, isBidSection = false }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await api.get(endpoint);
    let listings = response.data.data || [];
    
    // For bids, extract and transform data
    if (isBidSection) {
      listings = listings
        .map(bid => ({
          ...bid.listing,
          // Add bid-specific data to the listing object
          bids: bid.listing.bids || [],
          endsAt: bid.listing.endsAt,
          // Preserve bid-specific information if needed
          myBidAmount: bid.amount
        }))
        .filter(listing => {
          const isValid = listing && listing.id;
          const isActive = new Date(listing.endsAt) > new Date();
          return isValid && isActive;
        });

     
    }

    container.innerHTML = listings.length > 0 
      ? listings.map(createProfileCard).join('') 
      : `<p class="text-gray-500 text-center">${fallbackText}</p>`;

  } catch (error) {
    console.error(`Failed to load ${containerId}:`, error);
    container.innerHTML = `<p class="text-red-500 text-center">Error loading content</p>`;
  }
}
function createProfileCard(listing) {
  // 1. Safety check for invalid listings
  if (!listing) {
    console.warn('Attempted to render invalid listing:', listing);
    return '';
  }

  // 2. Calculate auction status
  const endsAt = new Date(listing.endsAt);
  const now = new Date();
  const ended = endsAt < now;

  // 3. Bid information handling
  let bidDisplay = 'No bids yet';
  const hasBids = listing.bids?.length > 0;
  
  // If we have bid data from the profile endpoint
  if (listing.myBidAmount) {
    bidDisplay = `Your bid: $${listing.myBidAmount}`;
    
    // Show both user's bid and current highest if available
    if (hasBids) {
      const highestBid = Math.max(...listing.bids.map(b => b.amount));
      bidDisplay += ` | Highest: $${highestBid}`;
    }
  } else if (hasBids) {
    // Regular listing display
    const highestBid = Math.max(...listing.bids.map(b => b.amount));
    bidDisplay = `Current bid: $${highestBid}`;
  }

  // 4. Media handling with fallback
  const mediaUrl = listing.media?.[0]?.url || 'https://fakeimg.pl/600x400?text=??';
  const mediaAlt = listing.media?.[0]?.alt || 'Auction image';

  // 5. Text truncation helpers
  const truncate = (text = '', max = 50) => 
    text.length > max ? text.substring(0, max - 3) + '...' : text;

  // 6. Time remaining calculation
  const getTimeLeft = () => {
    if (ended) return 'Ended';
    
    const diffMs = endsAt - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  };

  // 7. Card template
  return `
    <div class="bg-white shadow-md rounded-lg overflow-hidden flex flex-col w-full h-full hover:shadow-lg transition-shadow">
      <!-- Image Section -->
      <div class="w-full h-48 flex items-center justify-center p-4 ">
        <img src="${mediaUrl}" 
             alt="${mediaAlt}" 
             class="object-cover w-full h-full rounded-lg">
      </div>

      <!-- Text Content -->
      <div class="p-4 flex flex-col justify-between flex-grow">
        <div>
          <!-- Title -->
          <h2 class="text-base font-bold mb-2 font-heading">
            ${truncate(listing.title || 'Untitled Auction', 40)}
          </h2>

          <!-- Description -->
          <p class="text-gray-600 text-sm mb-2 line-clamp-3 font-beiruti">
            ${truncate(listing.description || 'No description provided', 100)}
          </p>

          <!-- Bid + Time Info -->
          <div class="flex justify-between items-center text-sm font-beiruti mt-3">
            <span class="font-semibold ${listing.myBidAmount ? 'text-green-600' : 'text-gray-700'}">
              ${bidDisplay}
            </span>
            <span class="${ended ? 'text-red-600' : 'text-blue-600'} font-medium">
              ${getTimeLeft()}
            </span>
          </div>
        </div>

        <!-- View Button -->
        <a href="/auctions/listing/index.html?id=${listing.id}" 
           class="mt-4 inline-block text-center text-white px-3 py-1.5 rounded 
                  transition text-sm bg-[#9B7E47] hover:bg-[#866C3C] font-beiruti">
          View Auction
        </a>
      </div>
    </div>
  `;
}


function truncateText(text = '', maxLength = 50) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function getTimeRemaining(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diffMs = end - now;
  
  if (diffMs <= 0) return 'Ended';
  
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${Math.floor(hours)}h ${Math.floor(minutes)}m left`;
}