// File: /javascript/utils/filterAuctions.mjs

/**
 * Filter auctions by category (tag).
 * If no category is given or category is 'all', return all auctions.
 * Additionally, if the current page is not the auctions page,
 * redirect to the auctions page with the selected category as a query parameter.
 */
export function filterByCategory(auctions, category) {
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
    // Assuming each listing has a "tags" array.
    const tagsLower = listing.tags?.map((tag) => tag.toLowerCase()) || [];
    return tagsLower.includes(category.toLowerCase());
  });
}
