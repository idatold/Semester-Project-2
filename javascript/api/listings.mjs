// File: /javascript/api/listings.mjs
import api from '../api/axios.mjs';


/**
 * Get ACTIVE listings (not ended), including bids
 * (no pagination)
 */
export async function getActiveListings(page = 1) {
  try {
    const response = await api.get(`/auction/listings?_active=true&_page=${page}&_bids=true`);
    // This should be { data: [...], meta: {...} }
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
