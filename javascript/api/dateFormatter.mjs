// File: /javascript/api/dateFormatter.mjs

/**
 * Format a date as "YYYY-MM-DD<br>HH:mm".
 * Returns "Unknown" if input is falsy or invalid.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDateWithBreak(dateString) {
  if (!dateString) return 'Unknown';

  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'Unknown';

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  return `${y}-${m}-${day}<br>${hh}:${mm}`;
}

/**
 * Format a date as "YYYY-MM-DD HH:mm" (no <br>).
 * Returns "Unknown" if input is falsy or invalid.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDateNoBreak(dateString) {
  if (!dateString) return 'Unknown';

  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'Unknown';

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  return `${y}-${m}-${day} ${hh}:${mm}`;
}
