// File: /javascript/api/listings.mjs
import api from '../api/axios.mjs';

/**
 * Create a new listing
 */
export async function createListing({ title, description, tags, media, endsAt }) {
  try {
    const body = { title, endsAt };
    if (description) body.description = description;
    if (tags) body.tags = tags;
    if (media) body.media = media;

    const response = await api.post('/auction/listings', body);
    return response.data.data; // newly created listing
  } catch (error) {
    console.error('Failed to create listing:', error);
    throw error;
  }
}

/**
 * Update a listing
 */
export async function updateListing(id, { title, description, tags, media }) {
  try {
    const body = {};
    if (title) body.title = title;
    if (description) body.description = description;
    if (tags) body.tags = tags;
    if (media) body.media = media;

    const response = await api.put(`/auction/listings/${id}`, body);
    return response.data.data; // updated listing
  } catch (error) {
    console.error(`Failed to update listing ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(id) {
  try {
    // The API returns 204 No Content on success
    await api.delete(`/auction/listings/${id}`);
    // Nothing to return
  } catch (error) {
    console.error(`Failed to delete listing ${id}:`, error);
    throw error;
  }
}


// In listings.mjs - update getAllListings to use _start
export async function getAllListings(page = 1, limit = 40) {
  const start = (page - 1) * limit;
  try {
    const response = await api.get(
      `/auction/listings?_bids=true&_seller=true&sort=created&order=desc&_start=${start}&_limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch auctions:', error);
    return { data: [], meta: { isLastPage: true } }; // Return safe empty data
  }
}



/**
 * Get ONE listing by ID
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
 * Place a bid on a listing
 */
export async function bidOnListing(listingId, amount) {
  try {
    const response = await api.post(`/auction/listings/${listingId}/bids`, {
      amount,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to bid on listing ${listingId}:`, error);
    throw error;
  }
}
