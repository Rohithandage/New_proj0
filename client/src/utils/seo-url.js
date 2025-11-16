// SEO-Friendly URL Utilities

/**
 * Converts a string to a SEO-friendly slug
 * @param {string} text - Text to convert
 * @returns {string} SEO-friendly slug
 */
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Creates SEO-friendly product URL
 * @param {string} productId - Product ID
 * @param {string} productName - Product name
 * @returns {string} SEO-friendly URL
 */
export const createProductURL = (productId, productName) => {
  const slug = slugify(productName);
  return `/product/${slug}-${productId}`;
};

/**
 * Creates SEO-friendly category URL
 * @param {string} category - Category name
 * @param {string} subcategory - Subcategory name (optional)
 * @returns {string} SEO-friendly URL
 */
export const createCategoryURL = (category, subcategory = null) => {
  const categorySlug = slugify(category);
  if (subcategory) {
    const subcategorySlug = slugify(subcategory);
    return `/category/${categorySlug}/${subcategorySlug}`;
  }
  return `/category/${categorySlug}`;
};

/**
 * Extracts product ID from SEO-friendly URL
 * @param {string} url - SEO-friendly URL
 * @returns {string|null} Product ID
 */
export const extractProductId = (url) => {
  const match = url.match(/[a-zA-Z0-9]{24}$/);
  return match ? match[0] : null;
};





