import './main.mjs';  
import { getAllListings } from './api/listings.mjs'; // Adjust path if needed

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
 */
function renderListing(listing) {
  const { id, title, description, media, endsAt } = listing;

  // 1) Create the card (322×440)
  const card = document.createElement('div');
  card.className = 'bg-white shadow-md rounded-lg overflow-hidden flex flex-col';
  card.style.width = '322px';
  card.style.height = '440px';

  // 2) Image container (224px tall)
  // Use the same horizontal padding as the text area so they align
  const imageContainer = document.createElement('div');
  imageContainer.style.width = '100%';
  imageContainer.style.height = '224px';
  // We'll do top/bottom = 0, left/right = 16px so the text lines up
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
  textArea.style.padding = '0 16px 16px 16px'; // no top padding, 16px bottom, 16px L/R

  // Title/description wrapper
  const textWrapper = document.createElement('div');

  // Title (add more margin under it)
  const h2 = document.createElement('h2');
  h2.className = 'text-l font-bold mb-4'; // <— "mb-4" for more space
  h2.textContent = truncateText(title || 'Untitled', 30);

  // Description
  const descP = document.createElement('p');
  descP.className = 'text-gray-600 mb-1';
  descP.textContent = truncateText(description || 'No description provided.', 60);
  descP.style.fontFamily = 'Beiruti';

  // Example placeholders for bid/time
  const bidP = document.createElement('p');
  bidP.className = 'font-semibold text-m';
  bidP.textContent = 'Current Bid: 2300'; // or dynamic
  bidP.style.fontFamily = 'Beiruti';

  const timeP = document.createElement('p');
  timeP.className = 'text-m text-gray-500';
  const remaining = getTimeRemaining(endsAt);
  timeP.textContent = `Time remaining: ${remaining}`;
  timeP.style.fontFamily = 'Beiruti';

  // Append them
  textWrapper.appendChild(h2);
  textWrapper.appendChild(descP);
  textWrapper.appendChild(bidP);
  textWrapper.appendChild(timeP);

  // Center the "View Listing" button while text is left-aligned
  const buttonWrapper = document.createElement('div');
  buttonWrapper.style.width = '100%';
  buttonWrapper.style.textAlign = 'center';

  const viewBtn = document.createElement('button');
  viewBtn.textContent = 'View Listing';
  viewBtn.setAttribute('data-id', id);

  // Use a neutral base class for spacing and rounded corners
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

  // Put text + button wrapper into textArea
  textArea.appendChild(textWrapper);
  textArea.appendChild(buttonWrapper);

  card.appendChild(textArea);
  listingsContainer.appendChild(card);
}

/**
 * Fetch and display all listings
 */
async function initListings() {
  listingsContainer.innerHTML = 'Loading auctions...';

  try {
    const listings = await getAllListings();
    listingsContainer.innerHTML = '';
    listings.forEach(renderListing);
  } catch (error) {
    listingsContainer.innerHTML = '<p>Failed to load listings.</p>';
    console.error(error);
  }
}

initListings();
