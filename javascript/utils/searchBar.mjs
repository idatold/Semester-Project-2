// File: /javascript/searchBar.mjs

export function initSearchBar() {
    const searchInput = document.querySelector('.searchBar');
    if (!searchInput) return; // No search bar on this page? Do nothing.
  
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
          // Redirect to auctions page with ?search= param
          window.location.href = `/auctions/index.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
  