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
 * Render a single listing card
 */
function renderListing(listing) {
  const { id, title, description, media } = listing;

  // 1) Create the card (322×440)
  const card = document.createElement('div');
  card.className = 'bg-white shadow-md rounded-lg overflow-hidden flex flex-col';
  card.style.width = '322px';
  card.style.height = '440px';

  // 2) Image container (224px)
  const imageContainer = document.createElement('div');
  imageContainer.style.width = '100%';
  imageContainer.style.height = '224px';
  imageContainer.style.display = 'flex';
  imageContainer.style.justifyContent = 'center';
  imageContainer.style.alignItems = 'center';
  imageContainer.style.padding = '16px';

  // The image (281×182)
  const imageUrl = media?.[0]?.url || 'https://fakeimg.pl/600x400?text=??';
  const imageEl = document.createElement('img');
  imageEl.src = imageUrl;
  imageEl.alt = title || 'No title';
  imageEl.style.width = '281px';
  imageEl.style.height = '182px';
  imageEl.style.objectFit = 'cover';

  imageContainer.appendChild(imageEl);
  card.appendChild(imageContainer);

  // 3) Text area (440 - 224 = 216px)
  const textArea = document.createElement('div');
  textArea.className = 'flex flex-col justify-between';
  textArea.style.width = '100%';
  textArea.style.height = '216px';
  textArea.style.padding = '16px';

  // Truncate title & description
  const truncatedTitle = truncateText(title || 'Untitled', 30);
  const truncatedDesc = truncateText(description || 'No description provided.', 60);

  // Title/description wrapper
  const textWrapper = document.createElement('div');

  // Title
  const h2 = document.createElement('h2');
  h2.className = 'text-l font-bold mb-1';
  h2.textContent = truncatedTitle;

  // Description
  const descP = document.createElement('p');
  descP.className = 'text-gray-600 mb-1';
  descP.textContent = truncatedDesc;
  descP.style.fontFamily = 'Beiruti';

  // Example placeholders for bid/time
  const bidP = document.createElement('p');
  bidP.className = 'font-semibold text-m';
  bidP.textContent = 'Current Bid: 2300';
  bidP.style.fontFamily = 'Beiruti';

  const timeP = document.createElement('p');
  timeP.className = 'text-m text-gray-500';
  timeP.textContent = 'Time remaining: 4d 3h';
  timeP.style.fontFamily = 'Beiruti';

  // Append them
  textWrapper.appendChild(h2);
  textWrapper.appendChild(descP);
  textWrapper.appendChild(bidP);
  textWrapper.appendChild(timeP);

  // "View Listing" button
  const viewBtn = document.createElement('button');
  viewBtn.textContent = 'View Listing';
  viewBtn.setAttribute('data-id', id);

  // Use a neutral base class for spacing and rounded corners
  viewBtn.className = 'mt-2 text-white px-4 py-2 rounded transition self-start';

  // Force the base color to #9B7E47
  viewBtn.style.backgroundColor = '#9B7E47';

  // Simple hover effect with mouse events
  viewBtn.addEventListener('mouseover', () => {
    viewBtn.style.backgroundColor = '#866C3C'; // a slightly darker shade
  });
  viewBtn.addEventListener('mouseout', () => {
    viewBtn.style.backgroundColor = '#9B7E47';
  });

  // On click => single listing page
  // CHANGED: now points to "/auctions/listing/index.html"
  viewBtn.addEventListener('click', () => {
    window.location.href = `/auctions/listing/index.html?id=${id}`;
  });

  // Put text + button into textArea
  textArea.appendChild(textWrapper);
  textArea.appendChild(viewBtn);

  // Attach textArea to the card
  card.appendChild(textArea);

  // Attach card to the container
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
