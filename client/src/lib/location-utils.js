/**
 * Location detection utility
 * Detects user location (India or Outside India) using browser geolocation or IP-based detection
 */

// Store location in localStorage to avoid repeated API calls
const LOCATION_STORAGE_KEY = 'user_location';
const LOCATION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Detect user location using browser geolocation API
 * Falls back to IP-based detection if geolocation is not available
 */
export const detectUserLocation = async () => {
  // Check if we have a cached location
  const cachedLocation = getCachedLocation();
  if (cachedLocation) {
    return cachedLocation;
  }

  try {
    // Try browser geolocation first
    const location = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Simple check: India is roughly between 6.5°N to 35.5°N and 68°E to 97°E
          const isIndia = 
            latitude >= 6.5 && latitude <= 35.5 &&
            longitude >= 68 && longitude <= 97;
          
          resolve(isIndia ? 'india' : 'outside_india');
        },
        (error) => {
          reject(error);
        },
        {
          timeout: 5000,
          enableHighAccuracy: false
        }
      );
    });

    cacheLocation(location);
    return location;
  } catch (error) {
    console.log('Geolocation failed, trying IP-based detection:', error);
    
    // Fallback to IP-based detection
    try {
      const location = await detectLocationByIP();
      cacheLocation(location);
      return location;
    } catch (ipError) {
      console.log('IP-based detection failed:', ipError);
      // Default to India if detection fails
      const defaultLocation = 'india';
      cacheLocation(defaultLocation);
      return defaultLocation;
    }
  }
};

/**
 * Detect location using IP geolocation API (free service)
 */
const detectLocationByIP = async () => {
  try {
    // Using ipapi.co free service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.country_code === 'IN') {
      return 'india';
    } else {
      return 'outside_india';
    }
  } catch (error) {
    console.error('IP-based location detection error:', error);
    throw error;
  }
};

/**
 * Get cached location from localStorage
 */
const getCachedLocation = () => {
  try {
    const cached = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!cached) return null;
    
    const { location, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 24 hours)
    if (now - timestamp < LOCATION_TIMEOUT) {
      return location;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading cached location:', error);
    return null;
  }
};

/**
 * Cache location in localStorage
 */
const cacheLocation = (location) => {
  try {
    localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({
        location,
        timestamp: Date.now()
      })
    );
  } catch (error) {
    console.error('Error caching location:', error);
  }
};

/**
 * Clear cached location (useful for testing or manual override)
 */
export const clearLocationCache = () => {
  localStorage.removeItem(LOCATION_STORAGE_KEY);
};

/**
 * Set location manually (for admin testing or user preference)
 */
export const setUserLocation = (location) => {
  if (location !== 'india' && location !== 'outside_india') {
    throw new Error('Invalid location. Must be "india" or "outside_india"');
  }
  cacheLocation(location);
};

/**
 * Get current user location (from cache or detect)
 */
export const getUserLocation = async () => {
  const cached = getCachedLocation();
  if (cached) {
    return cached;
  }
  return await detectUserLocation();
};








