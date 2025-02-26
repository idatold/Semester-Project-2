// accessToken.mjs

/**
 * Store the access token in localStorage under "accessToken"
 */
export function storeAccessToken(accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
  
  /**
   * Retrieve the access token from localStorage
   */
  export function getAccessToken() {
    return localStorage.getItem('accessToken');
  }
  
  /**
   * Clear the stored token (useful for logout)
   */
  export function clearAccessToken() {
    localStorage.removeItem('accessToken');
  }
  