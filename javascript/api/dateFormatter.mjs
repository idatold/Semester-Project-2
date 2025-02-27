// dateFormatter.mjs

/**
 * Format an ISO date string as "YYYY-MM-DD<br>HH:MM"
 * for the main listing info. 
 */
export function formatDateWithBreak(dateString) {
    if (!dateString) return 'Unknown';
    const dateObj = new Date(dateString);
  
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}<br>${hours}:${minutes}`;
  }
  
  /**
   * Format an ISO date string as "YYYY-MM-DD HH:MM"
   * for the bids, so they stay on one line.
   */
  export function formatDateNoBreak(dateString) {
    if (!dateString) return 'Unknown';
    const dateObj = new Date(dateString);
  
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  