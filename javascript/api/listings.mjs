// File: /javascript/api/listings.mjs
import api from '../api/axios.mjs';

/**
 * Create a new listing.
 * @param {Object} params
 * @param {string} params.title
 * @param {string} [params.description]
 * @param {string[]} [params.tags]
 * @param {Array<{url:string, alt?:string}>} [params.media]
 * @param {string} params.endsAt - ISO date string
 * @returns {Promise<any>} Newly created listing
 */
export async function createListing({ title, description, tags, media, endsAt }) {
  try {
    const body = { title, endsAt };
    if (description) body.description = description;
    if (tags) body.tags = tags;
    if (media) body.media = media;

    const response = await api.post('/auction/listings', body);
    return response.data.data;
  } catch (error) {
    console.error('Failed to create listing:', error);
    throw error;
  }
}

/**
 * Update an existing listing.
 * @param {string} id
 * @param {Object} params
 * @param {string} [params.title]
 * @param {string} [params.description]
 * @param {string[]} [params.tags]
 * @param {Array<{url:string, alt?:string}>} [params.media]
 * @returns {Promise<any>} Updated listing
 */
export async function updateListing(id, { title, description, tags, media }) {
  try {
    const body = {};
    if (title) body.title = title;
    if (description) body.description = description;
    if (tags) body.tags = tags;
    if (media) body.media = media;

    const response = await api.put(`/auction/listings/${id}`, body);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update listing ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a listing.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteListing(id) {
  try {
    await api.delete(`/auction/listings/${id}`);
  } catch (error) {
    console.error(`Failed to delete listing ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch a page of listings with seller & bid info.
 * Uses Noroff params: _bids, _seller, sort/order, _start, _limit.
 * @param {number} [page=1] - 1-based page number
 * @param {number} [limit=40] - items per page
 * @returns {Promise<{data:any[], meta:object}>} API payload with data[] and meta
 */
export async function getAllListings(page = 1, limit = 40) {
  const start = (page - 1) * limit;
  try {
    const { data } = await api.get(
      `/auction/listings?_bids=true&_seller=true&sort=created&order=desc&_start=${start}&_limit=${limit}`
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch auctions:', error);
    return { data: [], meta: { isLastPage: true } };
  }
}

/**
 * Get a single listing by ID.
 * @param {string} id
 * @param {{seller?: boolean, bids?: boolean}} [options]
 * @returns {Promise<any>}
 */
export async function getSingleListing(id, { seller, bids } = {}) {
  try {
    let endpoint = `/auction/listings/${id}`;
    const queryParams = [];
    if (seller) queryParams.push('_seller=true');
    if (bids) queryParams.push('_bids=true');
    if (queryParams.length) endpoint += `?${queryParams.join('&')}`;

    const response = await api.get(endpoint);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch listing ${id}:`, error);
    throw error;
  }
}

/**
 * Place a bid on a listing.
 * @param {string} listingId
 * @param {number} amount
 * @returns {Promise<any>}
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
