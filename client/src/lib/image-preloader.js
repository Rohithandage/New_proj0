/**
 * Aggressive Image Preloader Utility
 * Preloads images immediately for instant display
 */

const imageCache = typeof window !== 'undefined' && window.__imageCache 
  ? window.__imageCache 
  : new Set();
const preloadQueue = [];
let isProcessing = false;
const preloadLinks = new Set(); // Track preload links

/**
 * Preload a single image with multiple strategies
 */
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (!src || imageCache.has(src)) {
      resolve();
      return;
    }

    // Strategy 1: Use global preloader if available (from inline script - fastest)
    if (typeof window !== 'undefined' && window.__preloadImage) {
      window.__preloadImage(src);
      imageCache.add(src);
      resolve();
      return;
    }

    // Strategy 2: Use Image object (browser native caching)
    const img = new Image();
    img.onload = () => {
      imageCache.add(src);
      resolve();
    };
    img.onerror = () => {
      // Still resolve to not block other images
      resolve();
    };
    
    // Start loading immediately
    img.src = src;
    
    // If already cached by browser, resolve immediately
    if (img.complete) {
      imageCache.add(src);
      resolve();
    }
  });
};

/**
 * Aggressively preload multiple images in parallel batches
 */
export const preloadImages = async (urls, priority = 'high', batchSize = 6) => {
  if (!urls || urls.length === 0) return;
  
  // Filter out already cached images
  const uncachedUrls = urls.filter(url => url && !imageCache.has(url));
  if (uncachedUrls.length === 0) return;
  
  if (priority === 'high') {
    // High priority: load in parallel batches immediately
    const batches = [];
    for (let i = 0; i < uncachedUrls.length; i += batchSize) {
      batches.push(uncachedUrls.slice(i, i + batchSize));
    }
    
    // Load all batches in parallel
    await Promise.allSettled(
      batches.map(batch => Promise.allSettled(batch.map(url => preloadImage(url))))
    );
  } else {
    // Low priority: queue for background loading
    preloadQueue.push(...uncachedUrls);
    processQueue();
  }
};

/**
 * Process preload queue in background with larger batches
 */
const processQueue = async () => {
  if (isProcessing || preloadQueue.length === 0) return;
  
  isProcessing = true;
  
  // Process 6 images at a time for faster loading
  const batch = preloadQueue.splice(0, 6);
  await Promise.allSettled(batch.map(url => preloadImage(url)));
  
  isProcessing = false;
  
  // Continue processing immediately if more items
  if (preloadQueue.length > 0) {
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(processQueue, { timeout: 100 });
    } else {
      setTimeout(processQueue, 50);
    }
  }
};

/**
 * Preload image with link rel=preload for critical images (most aggressive)
 */
export const preloadCriticalImage = (src) => {
  if (typeof document === 'undefined' || !src) return;
  
  // Skip if already preloaded
  if (preloadLinks.has(src)) return;
  preloadLinks.add(src);
  
  // Strategy 1: Use <link rel="preload"> for highest priority
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = 'high';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
  
  // Strategy 2: Also use Image object for browser cache
  const img = new Image();
  img.onload = () => {
    imageCache.add(src);
  };
  img.src = src;
};

/**
 * Preload images for products array (extracts all image URLs)
 */
export const preloadProductImages = (products, priority = 'high') => {
  if (!products || products.length === 0) return;
  
  const imageUrls = [];
  products.forEach(product => {
    if (product.images && product.images.length > 0) {
      // Preload first 2 images of each product
      imageUrls.push(...product.images.slice(0, 2));
    } else if (product.image) {
      imageUrls.push(product.image);
    }
  });
  
  if (imageUrls.length > 0) {
    preloadImages(imageUrls, priority, 8); // Larger batch size for products
  }
};

/**
 * Preload images immediately using link tags in head (most aggressive)
 */
export const preloadImagesInHead = (urls) => {
  if (typeof document === 'undefined' || !urls || urls.length === 0) return;
  
  urls.forEach((url, index) => {
    if (!url || preloadLinks.has(url)) return;
    preloadLinks.add(url);
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = index < 4 ? 'high' : 'auto'; // First 4 get high priority
    document.head.appendChild(link);
    
    // Also trigger Image object for browser cache
    const img = new Image();
    img.src = url;
  });
};

/**
 * Clear image cache
 */
export const clearImageCache = () => {
  imageCache.clear();
  preloadLinks.clear();
};

