/**
 * Formats a date like "YYYY-MM-DD<br>HH:mm".
 * Returns "Unknown" if the input is falsy or invalid.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDateWithBreak(dateString) {
  if (!dateString) return 'Unknown';

  const dateObj = new Date(dateString);
  if (Number.isNaN(dateObj.getTime())) return 'Unknown';

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}<br>${hours}:${minutes}`;
}
