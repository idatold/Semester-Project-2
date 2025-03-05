// File: /javascript/utils/searchBar.mjs
export function initSearch() {
  const searchInput = document.querySelector('.searchBar');
  if (!searchInput) return;

  const params = new URLSearchParams(window.location.search);
  searchInput.value = params.get('search') || '';

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch(e.target.value.trim());
  });
}

export function handleSearch(query) {
  const url = new URL(window.location.href);
  query ? url.searchParams.set('search', query) : url.searchParams.delete('search');
  url.searchParams.delete('page');
  url.searchParams.delete('category');
  window.location.href = url.toString();
}

export function displaySearchHeader(searchQuery) {
  const container = document.getElementById('listings-container');
  if (!container || !searchQuery) return;

  const existing = document.querySelector('.search-header');
  if (existing) existing.remove();

  const header = document.createElement('div');
  header.className = 'search-header mb-8 text-center';
  header.innerHTML = `
    <h2 class="text-2xl font-bold mb-2">Search Results</h2>
    <p class="text-gray-600">
      Showing results for: 
      <span class="text-[#9B7E47] font-medium">"${searchQuery}"</span>
      <button class="ml-2 text-sm text-gray-500 hover:text-[#9B7E47]" onclick="clearSearch()">
        (clear)
      </button>
    </p>
  `;
  container.parentElement.prepend(header);
}

export function clearSearch() {
  const url = new URL(window.location.href);
  url.searchParams.delete('search');
  window.location.href = url.toString();
}