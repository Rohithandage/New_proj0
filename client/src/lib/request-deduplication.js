/**
 * Request Deduplication Utility
 * Prevents duplicate API calls by tracking in-flight requests
 */

const pendingRequests = new Map();

/**
 * Deduplicate API requests - if same request is already in flight, return the same promise
 */
export const deduplicateRequest = (key, requestFn) => {
  // If request is already pending, return the existing promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Create new request promise
  const requestPromise = requestFn()
    .then((response) => {
      // Remove from pending after completion
      pendingRequests.delete(key);
      return response;
    })
    .catch((error) => {
      // Remove from pending on error
      pendingRequests.delete(key);
      throw error;
    });
  
  // Store the promise
  pendingRequests.set(key, requestPromise);
  
  return requestPromise;
};

/**
 * Generate request key from URL and params
 */
export const generateRequestKey = (url, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${url}?${sortedParams}`;
};

/**
 * Clear all pending requests (useful for cleanup)
 */
export const clearPendingRequests = () => {
  pendingRequests.clear();
};

