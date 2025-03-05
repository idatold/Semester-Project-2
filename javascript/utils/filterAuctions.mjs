// File: /javascript/utils/filterAuctions.mjs

/**
 * Filter auctions by category.
 */
export function filterByCategory(auctions, category) {
  // Debug: see which category we're filtering
  console.log("filterByCategory called with category:", category);

  // If we're not on the auctions page, redirect to it with the category.
  if (!window.location.pathname.includes('/auctions/')) {
    window.location.href = `/auctions/index.html?category=${encodeURIComponent(category || 'all')}`;
    // Return an empty array – this code should not execute further after a redirect.
    return [];
  }

  // On the auctions page, if no specific category is provided, return all auctions.
  if (!category || category === 'all') {
    console.log("No specific category or 'all' => returning all auctions");
    return auctions;
  }

  // Otherwise, filter by category.
  return auctions.filter((listing) => {
    // Debug: log the listing's tags
    console.log("Listing ID:", listing.id, "has tags:", listing.tags);

    const tagsLower = listing.tags?.map((tag) => tag.toLowerCase()) || [];

    // Debug: check if it passes
    const passes = tagsLower.includes(category.toLowerCase());
    console.log("Does listing", listing.id, "include", category.toLowerCase(), "?", passes);

    return passes;
  });
}
