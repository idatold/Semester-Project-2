// File: /javascript/utils/filterAuctions.mjs

/**
 * Filter auctions by category.
 */
export function filterByCategory(auctions, category) {
  // Debug: see which category we're filtering


  // If we're not on the auctions page, redirect to it with the category.
  if (!window.location.pathname.includes('/auctions/')) {
    window.location.href = `/auctions/index.html?category=${encodeURIComponent(category || 'all')}`;
    // Return an empty array – this code should not execute further after a redirect.
    return [];
  }

  // On the auctions page, if no specific category is provided, return all auctions.
  if (!category || category === 'all') {
  
    return auctions;
  }

  // Otherwise, filter by category.
  return auctions.filter((listing) => {
    // Debug: log the listing's tags
 

    const tagsLower = listing.tags?.map((tag) => tag.toLowerCase()) || [];

    // Debug: check if it passes
    const passes = tagsLower.includes(category.toLowerCase());
   

    return passes;
  });
}
