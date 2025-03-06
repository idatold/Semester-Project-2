// File: /javascript/utils/sortAuctions.mjs

/**
 * Sort by newest but show active listings first, then ended.
 */
export function sortByNewest(auctions) {


  const now = new Date();
  return [...auctions].sort((a, b) => {
    const aEnded = new Date(a.endsAt) <= now;
    const bEnded = new Date(b.endsAt) <= now;

    // 1) If one is ended and the other is active, active goes first
    if (!aEnded && bEnded) return -1; // a is active, b is ended => a first
    if (aEnded && !bEnded) return 1;  // a is ended, b is active => b first

    // 2) Otherwise, both ended or both active => sort by created desc
    const aCreated = a.created ? new Date(a.created).getTime() : 0;
    const bCreated = b.created ? new Date(b.created).getTime() : 0;
    return bCreated - aCreated;
  });
}


/**
 * Sort by most bids => compare listing.bids.length (descending)
 */
export function sortByMostBids(auctions) {
  return [...auctions].sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0));
}

/**
 * Sort by highest price => compare highest bid (descending)
 */
export function sortByHighestPrice(auctions) {
  return [...auctions].sort((a, b) => getHighestBid(b) - getHighestBid(a));
}

/**
 * Sort by lowest price => compare highest bid (ascending)
 */
export function sortByLowestPrice(auctions) {
  return [...auctions].sort((a, b) => getHighestBid(a) - getHighestBid(b));
}

/**
 * Sort by ending soonest => compare listing.endsAt (ascending)
 */
export function sortByEndingSoonest(auctions) {
  return [...auctions].sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
}

/**
 * Helper to get highest bid for a single listing
 */
function getHighestBid(listing) {
  if (!listing.bids || listing.bids.length === 0) return 0;
  const amounts = listing.bids.map((bid) => bid.amount);
  return Math.max(...amounts);
}
