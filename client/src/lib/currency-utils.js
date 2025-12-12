/**
 * Currency conversion utility
 * Converts Indian Rupee (INR) to user's country currency
 */

// Store currency info in localStorage to avoid repeated API calls
const CURRENCY_STORAGE_KEY = 'user_currency_info';
const CURRENCY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  'INR': '₹',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CNY': '¥',
  'AUD': 'A$',
  'CAD': 'C$',
  'SGD': 'S$',
  'HKD': 'HK$',
  'CHF': 'CHF',
  'NZD': 'NZ$',
  'AED': 'AED',
  'SAR': 'SAR',
  'MYR': 'RM',
  'THB': '฿',
  'IDR': 'Rp',
  'PHP': '₱',
  'KRW': '₩',
  'VND': '₫',
  'BRL': 'R$',
  'MXN': 'Mex$',
  'ZAR': 'R',
  'RUB': '₽',
  'TRY': '₺',
  'PKR': '₨',
  'BDT': '৳',
  'LKR': 'Rs',
  'NPR': 'Rs'
};

// Country to currency code mapping (default)
const COUNTRY_TO_CURRENCY = {
  'IN': 'INR',
  'US': 'USD',
  'GB': 'GBP',
  'CA': 'CAD',
  'AU': 'AUD',
  'DE': 'EUR',
  'FR': 'EUR',
  'IT': 'EUR',
  'ES': 'EUR',
  'NL': 'EUR',
  'BE': 'EUR',
  'AT': 'EUR',
  'PT': 'EUR',
  'IE': 'EUR',
  'FI': 'EUR',
  'GR': 'EUR',
  'JP': 'JPY',
  'CN': 'CNY',
  'SG': 'SGD',
  'HK': 'HKD',
  'CH': 'CHF',
  'NZ': 'NZD',
  'AE': 'AED',
  'SA': 'SAR',
  'MY': 'MYR',
  'TH': 'THB',
  'ID': 'IDR',
  'PH': 'PHP',
  'KR': 'KRW',
  'VN': 'VND',
  'BR': 'BRL',
  'MX': 'MXN',
  'ZA': 'ZAR',
  'RU': 'RUB',
  'TR': 'TRY',
  'PK': 'PKR',
  'BD': 'BDT',
  'LK': 'LKR',
  'NP': 'NPR'
};

/**
 * Get cached currency info from localStorage
 */
export const getCachedCurrencyInfo = () => {
  try {
    const cached = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (!cached) return null;
    
    const { currencyInfo, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 24 hours)
    if (now - timestamp < CURRENCY_TIMEOUT) {
      return currencyInfo;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(CURRENCY_STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading cached currency info:', error);
    return null;
  }
};

/**
 * Cache currency info in localStorage
 */
const cacheCurrencyInfo = (currencyInfo) => {
  try {
    localStorage.setItem(
      CURRENCY_STORAGE_KEY,
      JSON.stringify({
        currencyInfo,
        timestamp: Date.now()
      })
    );
  } catch (error) {
    console.error('Error caching currency info:', error);
  }
};

/**
 * Detect user country using IP-based API
 */
const detectUserCountry = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      countryCode: data.country_code || 'IN',
      countryName: data.country_name || 'India'
    };
  } catch (error) {
    console.error('Country detection failed:', error);
    return {
      countryCode: 'IN',
      countryName: 'India'
    };
  }
};

/**
 * Get exchange rate from INR to target currency
 * Uses free API (exchangerate-api.com)
 */
const getExchangeRate = async (targetCurrency) => {
  try {
    // Using exchangerate-api.com free tier
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/INR`);
    const data = await response.json();
    
    if (data.rates && data.rates[targetCurrency]) {
      return data.rates[targetCurrency];
    }
    
    // Fallback: try alternative API
    try {
      const altResponse = await fetch(`https://api.fixer.io/latest?base=INR&symbols=${targetCurrency}`);
      const altData = await altResponse.json();
      if (altData.rates && altData.rates[targetCurrency]) {
        return altData.rates[targetCurrency];
      }
    } catch (altError) {
      console.log('Alternative API failed:', altError);
    }
    
    // If still no rate, return 1 (no conversion)
    return 1;
  } catch (error) {
    console.error('Exchange rate API failed:', error);
    // Return 1 as fallback (no conversion)
    return 1;
  }
};

/**
 * Get currency info for user (country detection + exchange rate)
 * Also checks admin-configured currency settings
 */
export const getUserCurrencyInfo = async (adminCurrencySettings = null) => {
  // Check cache first
  const cached = getCachedCurrencyInfo();
  if (cached) {
    return cached;
  }

  try {
    // Detect user country
    const { countryCode, countryName } = await detectUserCountry();
    
    // Check if admin has configured currency for this country
    let currencyCode = null;
    let exchangeRate = 1;
    
    if (adminCurrencySettings && adminCurrencySettings[countryCode]) {
      // Use admin-configured currency
      currencyCode = adminCurrencySettings[countryCode].currency;
      exchangeRate = adminCurrencySettings[countryCode].exchangeRate;
      
      // If exchange rate is not set, null, or is exactly 1 (might be default), fetch it automatically
      // Only auto-fetch if currency is not INR
      if (currencyCode !== 'INR' && (!exchangeRate || exchangeRate === 1)) {
        const fetchedRate = await getExchangeRate(currencyCode);
        // Only use fetched rate if admin rate was not explicitly set (was 1 or null)
        if (!exchangeRate || exchangeRate === 1) {
          exchangeRate = fetchedRate;
        }
      }
    } else {
      // Use default currency mapping
      currencyCode = COUNTRY_TO_CURRENCY[countryCode] || 'INR';
      
      // If not INR, get exchange rate
      if (currencyCode !== 'INR') {
        exchangeRate = await getExchangeRate(currencyCode);
      }
    }
    
    const currencyInfo = {
      countryCode,
      countryName,
      currencyCode,
      currencySymbol: CURRENCY_SYMBOLS[currencyCode] || currencyCode,
      exchangeRate,
      isINR: currencyCode === 'INR'
    };
    
    // Cache the result
    cacheCurrencyInfo(currencyInfo);
    
    return currencyInfo;
  } catch (error) {
    console.error('Error getting user currency info:', error);
    // Return default (INR)
    return {
      countryCode: 'IN',
      countryName: 'India',
      currencyCode: 'INR',
      currencySymbol: '₹',
      exchangeRate: 1,
      isINR: true
    };
  }
};

/**
 * Convert INR price to user's currency
 */
export const convertPrice = (inrPrice, currencyInfo) => {
  if (!currencyInfo || currencyInfo.isINR) {
    return inrPrice;
  }
  
  return inrPrice * currencyInfo.exchangeRate;
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (price, currencyInfo) => {
  if (!currencyInfo) {
    return `₹${price.toLocaleString()}`;
  }
  
  const convertedPrice = convertPrice(price, currencyInfo);
  const symbol = currencyInfo.currencySymbol || currencyInfo.currencyCode;
  
  // For some currencies, symbol comes after the number
  if (['EUR', 'GBP'].includes(currencyInfo.currencyCode)) {
    return `${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
  }
  
  // Default: symbol before number
  return `${symbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Clear currency cache (useful for testing or manual override)
 */
export const clearCurrencyCache = () => {
  localStorage.removeItem(CURRENCY_STORAGE_KEY);
};

/**
 * Get all available currencies for admin panel
 */
export const getAvailableCurrencies = () => {
  return Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => ({
    code,
    symbol,
    name: getCurrencyName(code)
  }));
};

/**
 * Get currency name
 */
const getCurrencyName = (code) => {
  const names = {
    'INR': 'Indian Rupee',
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'JPY': 'Japanese Yen',
    'CNY': 'Chinese Yuan',
    'AUD': 'Australian Dollar',
    'CAD': 'Canadian Dollar',
    'SGD': 'Singapore Dollar',
    'HKD': 'Hong Kong Dollar',
    'CHF': 'Swiss Franc',
    'NZD': 'New Zealand Dollar',
    'AED': 'UAE Dirham',
    'SAR': 'Saudi Riyal',
    'MYR': 'Malaysian Ringgit',
    'THB': 'Thai Baht',
    'IDR': 'Indonesian Rupiah',
    'PHP': 'Philippine Peso',
    'KRW': 'South Korean Won',
    'VND': 'Vietnamese Dong',
    'BRL': 'Brazilian Real',
    'MXN': 'Mexican Peso',
    'ZAR': 'South African Rand',
    'RUB': 'Russian Ruble',
    'TRY': 'Turkish Lira',
    'PKR': 'Pakistani Rupee',
    'BDT': 'Bangladeshi Taka',
    'LKR': 'Sri Lankan Rupee',
    'NPR': 'Nepalese Rupee'
  };
  return names[code] || code;
};

/**
 * Get all available countries for admin panel
 */
export const getAvailableCountries = () => {
  return Object.entries(COUNTRY_TO_CURRENCY).map(([code, currency]) => ({
    code,
    currency,
    name: getCountryName(code)
  }));
};

/**
 * Get country name from code
 */
const getCountryName = (code) => {
  const names = {
    'IN': 'India',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'AT': 'Austria',
    'PT': 'Portugal',
    'IE': 'Ireland',
    'FI': 'Finland',
    'GR': 'Greece',
    'JP': 'Japan',
    'CN': 'China',
    'SG': 'Singapore',
    'HK': 'Hong Kong',
    'CH': 'Switzerland',
    'NZ': 'New Zealand',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'KR': 'South Korea',
    'VN': 'Vietnam',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'ZA': 'South Africa',
    'RU': 'Russia',
    'TR': 'Turkey',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'NP': 'Nepal'
  };
  return names[code] || code;
};

