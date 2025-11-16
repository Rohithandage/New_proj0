// Image Optimization Utilities

/**
 * Generate optimized image URL with width/height parameters
 * @param {string} imageUrl - Original image URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height (optional)
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, width = 800, height = null) => {
  if (!imageUrl) return '';
  
  // If using Cloudinary, add optimization parameters
  if (imageUrl.includes('cloudinary.com')) {
    const params = [`w_${width}`];
    if (height) params.push(`h_${height}`);
    params.push('q_auto', 'f_auto'); // Auto quality and format
    
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${params.join(',')}`;
  }
  
  return imageUrl;
};

/**
 * Generate srcset for responsive images
 * @param {string} imageUrl - Original image URL
 * @returns {string} srcset string
 */
export const generateSrcSet = (imageUrl) => {
  if (!imageUrl) return '';
  
  const widths = [400, 800, 1200, 1600];
  return widths.map(width => {
    const optimizedUrl = getOptimizedImageUrl(imageUrl, width);
    return `${optimizedUrl} ${width}w`;
  }).join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @returns {string} sizes string
 */
export const generateSizes = () => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};

/**
 * Get image dimensions for better loading
 * @param {string} imageUrl - Image URL
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export const getImageDimensions = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};





