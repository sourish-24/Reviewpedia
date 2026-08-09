/**
 * Formats a date string into DD/MM/YYYY format.
 * Examples:
 *   "2026-08-05" -> "05/08/2026"
 *   "2026-08-09T23:33:53.000Z" -> "09/08/2026"
 *   "13 days ago" -> "13 days ago" (keeps relative text intact)
 */
export function formatDate(dateStr, fallback = 'Unknown Date') {
  if (!dateStr) return fallback;

  const str = String(dateStr).trim();
  if (!str) return fallback;

  // Case 1: Standard YYYY-MM-DD format
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Case 2: Full ISO string starting with YYYY-MM-DD (e.g. 2026-08-09T23:33:53.000Z)
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})T/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Case 3: Already in DD/MM/YYYY or DD-MM-YYYY format
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Case 4: Parse with Date object for other valid date strings
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Case 5: Relative date strings like "13 days ago" or unparseable formats
  return str;
}
