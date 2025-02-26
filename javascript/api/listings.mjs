// listings.mjs
import api from '../api/axios.mjs';

/**
 * Get ALL listings
 */
export async function getAllListings() {
  try {
    // The endpoint is /auction/listings
    const response = await api.get('/auction/listings');
    // The API returns an object like { data: [...], meta: {...} }
    // We'll return the array of listings from response.data.data
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    throw error;
  }
}

/**
 * Get ONE listing by ID
 * @param {string} id - The listing's ID
 * @param {Object} options
 * @param {boolean} options.seller - Include seller info
 * @param {boolean} options.bids - Include bids
 * @returns {Object} The single listing object from response.data.data
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
    // The API typically returns { data: {...}, meta: {...} }
    // We'll return the listing object from response.data.data
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch listing ${id}:`, error);
    throw error;
  }
}

/**
 * Place a bid on a listing
 * @param {string} listingId - The listing's ID
 * @param {number} amount - The bid amount
 * @returns {Object} The updated listing object from response.data.data
 */
export async function bidOnListing(listingId, amount) {
  try {
    // POST /auction/listings/:id/bids with { amount }
    const response = await api.post(`/auction/listings/${listingId}/bids`, { amount });
    // The API typically returns { data: {...}, meta: {...} }
    // We'll return the updated listing object from response.data.data
    return response.data.data;
  } catch (error) {
    console.error(`Failed to bid on listing ${listingId}:`, error);
    throw error;
  }
}
