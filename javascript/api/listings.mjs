// listings.mjs
import api from '../api/axios.mjs'; 

/**
 * Get ALL listings
 */
export async function getAllListings() {
  try {
    // If your endpoint is /auction/listings
    const response = await api.get('/auction/listings');
    // The API returns an object like { data: [...], meta: {...} }
    // We only need the array from "data"
    return response.data.data; // <-- Changed from response.data to response.data.data
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    throw error;
  }
}

/**
 * Get ONE listing by ID
 * @param {string} id 
 * @param {Object} options 
 * @param {boolean} options.seller - Include seller info
 * @param {boolean} options.bids - Include bids
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
    // For single listing, the shape is also { data: { ... }, meta: {...} }
    // If you want just the listing object, you could do `return response.data.data;`
    // But if your code is expecting an object with { data, meta }, you can keep it as is:
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch listing ${id}:`, error);
    throw error;
  }
}

/**
 * Place a bid on a listing
 */
export async function bidOnListing(listingId, amount) {
  try {
    const response = await api.post(`/auction/listings/${listingId}/bids`, { amount });
    return response.data; // The updated listing object
  } catch (error) {
    console.error(`Failed to bid on listing ${listingId}:`, error);
    throw error;
  }
}

  