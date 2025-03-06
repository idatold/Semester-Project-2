// File: /javascript/searchBar.js

export function initSearchBar(selector = '.searchBar', buttonSelector = '#search-btn') {
  const searchInput = document.querySelector(selector);
  const searchBtn = document.querySelector(buttonSelector);
  if (!searchInput || !searchBtn) return;

  const handleSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
      // Redirect to the auctions page with the search query as URL parameter
      window.location.href = `/auctions/index.html?search=${encodeURIComponent(query)}`;
    }
  };

  // Listen for Enter key in the input
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  // Listen for button click
  searchBtn.addEventListener('click', handleSearch);
}
