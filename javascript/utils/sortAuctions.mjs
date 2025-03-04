// File: /javascript/utils/sortAuctions.mjs

/**
 * Sort by newest => compare listing.created (descending)
 */
export function sortByNewest(auctions) {
    return [...auctions].sort((a, b) => new Date(b.created) - new Date(a.created));
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
  