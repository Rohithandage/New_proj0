/**
 * API Request Cache Utility
 * Caches API responses to avoid duplicate requests and improve performance
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached responses

const cache = new Map();
const pendingRequests = new Map(); // Track in-flight requests for deduplication

/**
 * Generate cache key from URL and params
 */
const generateCacheKey = (url, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${url}?${sortedParams}`;
};

/**
 * Get or create cached request (deduplicates in-flight requests)
 */
export const getCachedRequest = async (url, params = {}, requestFn) => {
  const key = generateCacheKey(url, params);
  
  // Check cache first
  const cached = getCachedResponse(url, params);
  if (cached) {
    return Promise.resolve(cached);
  }
  
  // Check if request is already in flight
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Create new request
  const requestPromise = requestFn()
    .then((data) => {
      setCachedResponse(url, params, data);
      pendingRequests.delete(key);
      return data;
    })
    .catch((error) => {
      pendingRequests.delete(key);
      throw error;
    });
  
  pendingRequests.set(key, requestPromise);
  return requestPromise;
};

/**
 * Get cached response if available and not expired
 */
export const getCachedResponse = (url, params = {}) => {
  const key = generateCacheKey(url, params);
  const cached = cache.get(key);
  
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

/**
 * Cache API response
 */
export const setCachedResponse = (url, params = {}, data) => {
  // Clean up old entries if cache is too large
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  const key = generateCacheKey(url, params);
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Clear all cached responses
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
};

// Clean up expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(clearExpiredCache, 60000); // Every minute
}

