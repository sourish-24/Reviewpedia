/**
 * Helper to slugify a string into a clean URL segment
 */
export function slugify(text) {
  if (!text) return 'review';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'review';
}

/**
 * Returns the professional URL path for a review:
 * /reviews/:category/:id/:slug
 */
export function getReviewUrl(review) {
  if (!review) return '/browse';
  const id = review.id || review._id;
  if (!id) return '/browse';

  const category = (review.product?.category || 'general')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '') || 'general';

  const slug = slugify(review.product?.name || review.review?.title || 'review');

  return `/reviews/${category}/${id}/${slug}`;
}

/**
 * Extracts the review ID from the current pathname.
 * Supports:
 * - /reviews/:category/:id/:slug
 * - /reviews/:category/:id
 * - /reviews/:id
 * - /review/:id/:slug
 * - /review/:id
 */
export function extractReviewId(pathname) {
  if (!pathname) return null;

  // Match /reviews/:category/:id or /reviews/:category/:id/:slug
  // MongoDB ObjectIds are 24-character hex strings, or general alphanumeric IDs
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts[0] === 'reviews' || parts[0] === 'review') {
    if (parts.length >= 3 && (parts[0] === 'reviews')) {
      // /reviews/:category/:id/... -> parts[2] is ID
      return parts[2];
    } else if (parts.length >= 2) {
      // /review/:id/... or /reviews/:id -> parts[1] is ID
      return parts[1];
    }
  }

  // Fallback regex matching a 24 hex char ID or segment
  const match = pathname.match(/\/(?:reviews|review)(?:\/[^/]+)?\/([a-fA-F0-9]{24}|[a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  return null;
}
