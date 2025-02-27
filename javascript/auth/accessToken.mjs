// accessToken.mjs

export function storeAccessToken(accessToken) {
  // Store it under a known key, e.g. "token"
  localStorage.setItem('token', accessToken);
}

export function getAccessToken() {
  return localStorage.getItem('token');
}

export function clearAccessToken() {
  localStorage.removeItem('token');
}
