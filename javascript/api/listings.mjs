// listings.mjs
import api from '../api/axios.mjs';

/**
 * Get ALL listings (unchanged)
 */
export async function getAllListings() {
  try {
    const response = await api.get('/auction/listings');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    throw error;
  }
}

/**
 * NEW: Get ACTIVE listings (not ended) with pagination
 */
export async function getActiveListings(page = 1) {
  try {
    // The Auction API supports: 
    // _active=true => only not-ended
    // _page=page => which page to fetch
    // You can add &_limit=10 if you want 10 per page
    const response = await api.get(`/auction/listings?_active=true&_page=${page}`);
    // This typically returns { data: [...], meta: {...} }
    return response.data;
  } catch (error) {
    console.error('Failed to fetch active listings:', error);
    throw error;
  }
}

/**
 * Get ONE listing by ID (unchanged)
 */
export async function getSingleListing(id, { seller, bids } = {}) {
  try {
    let endpoint = `/auction/listings/${id}`;
    const queryParams = [];
    if (seller) queryParams.push('_seller=true');
    if (bids) queryParams.push('_bids=true');

    if (queryParams.length) {
      endpoint += `?${queryParams.join('&')}`;
    }

    const response = await api.get(endpoint);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch listing ${id}:`, error);
    throw error;
  }
}

/**
 * Place a bid on a listing (unchanged)
 */
export async function bidOnListing(listingId, amount) {
  try {
    const response = await api.post(`/auction/listings/${listingId}/bids`, { amount });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to bid on listing ${listingId}:`, error);
    throw error;
  }
}
