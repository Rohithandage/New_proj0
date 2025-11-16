const axios = require('axios');

// Web scraper to extract product data from affiliate links
const scrapeProductData = async (affiliateUrl, platform, taskType = 'all') => {
  try {
    // Validate URL
    if (!affiliateUrl || !platform) {
      throw new Error('Affiliate URL and platform are required');
    }
    
    // Set user agent to avoid blocking
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // Fetch the page
    const response = await axios.get(affiliateUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Accept redirects and client errors
    });
    
    if (response.status >= 400) {
      throw new Error(`HTTP ${response.status}: Unable to fetch page`);
    }
    
    const html = response.data;
    
    // Platform-specific scraping logic
    switch (platform.toLowerCase()) {
      case 'amazon':
        return scrapeAmazonData(html, taskType);
      case 'flipkart':
        return scrapeFlipkartData(html, taskType);
      case 'myntra':
        return scrapeMyntraData(html, taskType);
      case 'ajio':
        return scrapeAjioData(html, taskType);
      case 'nykaa':
        return scrapeNykaaData(html, taskType);
      case 'meesho':
        return scrapeMeeshoData(html, taskType);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    throw new Error(`Scraping error: ${error.message}`);
  }
};

// Helper function to extract price from various formats
const extractPrice = (text) => {
  if (!text) return null;
  
  // Remove currency symbols and extract numbers
  const priceMatch = text.toString().match(/[\d,]+\.?\d*/);
  if (priceMatch) {
    return parseFloat(priceMatch[0].replace(/,/g, ''));
  }
  
  return null;
};

// Helper function to extract rating
const extractRating = (text) => {
  if (!text) return null;
  
  const ratingMatch = text.toString().match(/(\d+\.?\d*)/);
  if (ratingMatch) {
    return parseFloat(ratingMatch[1]);
  }
  
  return null;
};

// Helper function to extract review count
const extractReviewCount = (text) => {
  if (!text) return null;
  
  // Handle formats like "1,234 reviews", "1.2k reviews", etc.
  const textStr = text.toString().toLowerCase();
  
  // Extract number
  const numberMatch = textStr.match(/([\d,]+\.?\d*)/);
  if (!numberMatch) return null;
  
  let number = parseFloat(numberMatch[1].replace(/,/g, ''));
  
  // Handle k, m suffixes
  if (textStr.includes('k') || textStr.includes(' thousand')) {
    number = number * 1000;
  } else if (textStr.includes('m') || textStr.includes(' million')) {
    number = number * 1000000;
  }
  
  return Math.round(number);
};

// Amazon scraping
const scrapeAmazonData = (html, taskType) => {
  const result = {};
  
  try {
    // Price extraction
    if (taskType === 'price' || taskType === 'all') {
      // Multiple selectors for price
      const priceSelectors = [
        /id="priceblock_[^"]*"[^>]*>[\s\S]*?₹\s*([\d,]+\.?\d*)/i,
        /class="a-price-whole"[^>]*>([\d,]+)/i,
        /id="priceblock_dealprice"[^>]*>[\s\S]*?₹\s*([\d,]+\.?\d*)/i,
        /"price":\s*"([^"]+)"/i,
        /₹\s*([\d,]+\.?\d*)/i
      ];
      
      for (const selector of priceSelectors) {
        const match = html.match(selector);
        if (match) {
          result.price = extractPrice(match[1]);
          break;
        }
      }
      
      // Original price (MRP)
      const mrpSelectors = [
        /class="basisPrice"[^>]*>[\s\S]*?₹\s*([\d,]+\.?\d*)/i,
        /id="priceblock_saleprice"[^>]*>[\s\S]*?₹\s*([\d,]+\.?\d*)/i,
        /"listPrice":\s*"([^"]+)"/i
      ];
      
      for (const selector of mrpSelectors) {
        const match = html.match(selector);
        if (match) {
          result.originalPrice = extractPrice(match[1]);
          break;
        }
      }
      
      // Calculate discount
      if (result.price && result.originalPrice && result.originalPrice > result.price) {
        result.discount = Math.round(((result.originalPrice - result.price) / result.originalPrice) * 100);
      }
    }
    
    // Rating extraction
    if (taskType === 'review' || taskType === 'all') {
      const ratingSelectors = [
        /id="acrPopover"[^>]*>[\s\S]*?([\d.]+)\s*out of/i,
        /class="a-icon-alt"[^>]*>([\d.]+)\s*out of/i,
        /"averageRating":\s*([\d.]+)/i
      ];
      
      for (const selector of ratingSelectors) {
        const match = html.match(selector);
        if (match) {
          result.rating = extractRating(match[1]);
          break;
        }
      }
      
      // Review count
      const reviewSelectors = [
        /id="acrCustomerReviewText"[^>]*>([\d,]+\s*(?:reviews?|ratings?))/i,
        /"totalReviews":\s*(\d+)/i,
        /([\d,]+)\s*(?:customer\s*)?reviews?/i
      ];
      
      for (const selector of reviewSelectors) {
        const match = html.match(selector);
        if (match) {
          result.reviews = extractReviewCount(match[1]);
          break;
        }
      }
    }
    
    // Availability
    if (taskType === 'availability' || taskType === 'all') {
      const inStockPatterns = [
        /In stock/i,
        /Available/i,
        /Add to Cart/i,
        /Buy Now/i
      ];
      
      const outOfStockPatterns = [
        /Currently unavailable/i,
        /Out of stock/i,
        /Temporarily out of stock/i
      ];
      
      const htmlLower = html.toLowerCase();
      
      result.inStock = outOfStockPatterns.some(pattern => pattern.test(htmlLower)) ? false :
        inStockPatterns.some(pattern => pattern.test(htmlLower)) ? true : null;
      
      if (result.inStock === null) {
        // Default to true if we can't determine
        result.inStock = true;
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Amazon scraping error: ${error.message}`);
  }
};

// Flipkart scraping
const scrapeFlipkartData = (html, taskType) => {
  const result = {};
  
  try {
    if (taskType === 'price' || taskType === 'all') {
      const priceSelectors = [
        /class="_30jeq3[^"]*"[^>]*>₹([\d,]+)/i,
        /class="price[^"]*"[^>]*>₹([\d,]+)/i,
        /₹\s*([\d,]+\.?\d*)/i
      ];
      
      for (const selector of priceSelectors) {
        const match = html.match(selector);
        if (match) {
          result.price = extractPrice(match[1]);
          break;
        }
      }
      
      // MRP
      const mrpSelectors = [
        /class="_3I9_wc[^"]*"[^>]*>₹([\d,]+)/i,
        /class="price[^"]*"[^>]*>₹([\d,]+)/i
      ];
      
      for (const selector of mrpSelectors) {
        const match = html.match(selector);
        if (match) {
          const mrp = extractPrice(match[1]);
          if (mrp && mrp > result.price) {
            result.originalPrice = mrp;
          }
          break;
        }
      }
      
      if (result.price && result.originalPrice && result.originalPrice > result.price) {
        result.discount = Math.round(((result.originalPrice - result.price) / result.originalPrice) * 100);
      }
    }
    
    if (taskType === 'review' || taskType === 'all') {
      const ratingMatch = html.match(/([\d.]+)\s*★/i) || html.match(/class="_2d4LTz"[^>]*>([\d.]+)/i);
      if (ratingMatch) {
        result.rating = extractRating(ratingMatch[1]);
      }
      
      const reviewMatch = html.match(/([\d,]+)\s*(?:reviews?|ratings?)/i);
      if (reviewMatch) {
        result.reviews = extractReviewCount(reviewMatch[1]);
      }
    }
    
    if (taskType === 'availability' || taskType === 'all') {
      const inStock = !/Out of Stock/i.test(html) && /Add to Cart/i.test(html);
      result.inStock = inStock;
    }
    
    return result;
  } catch (error) {
    throw new Error(`Flipkart scraping error: ${error.message}`);
  }
};

// Myntra scraping
const scrapeMyntraData = (html, taskType) => {
  const result = {};
  
  try {
    if (taskType === 'price' || taskType === 'all') {
      const priceMatch = html.match(/₹\s*([\d,]+)/i);
      if (priceMatch) {
        result.price = extractPrice(priceMatch[1]);
      }
      
      const mrpMatch = html.match(/MRP[^:]*:?\s*₹\s*([\d,]+)/i);
      if (mrpMatch) {
        result.originalPrice = extractPrice(mrpMatch[1]);
      }
      
      if (result.price && result.originalPrice && result.originalPrice > result.price) {
        result.discount = Math.round(((result.originalPrice - result.price) / result.originalPrice) * 100);
      }
    }
    
    if (taskType === 'review' || taskType === 'all') {
      const ratingMatch = html.match(/([\d.]+)\s*★/i);
      if (ratingMatch) {
        result.rating = extractRating(ratingMatch[1]);
      }
      
      const reviewMatch = html.match(/([\d,]+)\s*reviews?/i);
      if (reviewMatch) {
        result.reviews = extractReviewCount(reviewMatch[1]);
      }
    }
    
    if (taskType === 'availability' || taskType === 'all') {
      result.inStock = !/Out of Stock/i.test(html);
    }
    
    return result;
  } catch (error) {
    throw new Error(`Myntra scraping error: ${error.message}`);
  }
};

// Ajio scraping
const scrapeAjioData = (html, taskType) => {
  const result = {};
  
  try {
    if (taskType === 'price' || taskType === 'all') {
      const priceMatch = html.match(/₹\s*([\d,]+)/i);
      if (priceMatch) {
        result.price = extractPrice(priceMatch[1]);
      }
    }
    
    if (taskType === 'review' || taskType === 'all') {
      const ratingMatch = html.match(/([\d.]+)\s*★/i);
      if (ratingMatch) {
        result.rating = extractRating(ratingMatch[1]);
      }
    }
    
    if (taskType === 'availability' || taskType === 'all') {
      result.inStock = !/Out of Stock/i.test(html);
    }
    
    return result;
  } catch (error) {
    throw new Error(`Ajio scraping error: ${error.message}`);
  }
};

// Nykaa scraping
const scrapeNykaaData = (html, taskType) => {
  const result = {};
  
  try {
    if (taskType === 'price' || taskType === 'all') {
      const priceMatch = html.match(/₹\s*([\d,]+)/i);
      if (priceMatch) {
        result.price = extractPrice(priceMatch[1]);
      }
    }
    
    if (taskType === 'review' || taskType === 'all') {
      const ratingMatch = html.match(/([\d.]+)\s*★/i);
      if (ratingMatch) {
        result.rating = extractRating(ratingMatch[1]);
      }
    }
    
    if (taskType === 'availability' || taskType === 'all') {
      result.inStock = !/Out of Stock/i.test(html);
    }
    
    return result;
  } catch (error) {
    throw new Error(`Nykaa scraping error: ${error.message}`);
  }
};

// Meesho scraping
const scrapeMeeshoData = (html, taskType) => {
  const result = {};
  
  try {
    if (taskType === 'price' || taskType === 'all') {
      const priceMatch = html.match(/₹\s*([\d,]+)/i);
      if (priceMatch) {
        result.price = extractPrice(priceMatch[1]);
      }
    }
    
    if (taskType === 'review' || taskType === 'all') {
      const ratingMatch = html.match(/([\d.]+)\s*★/i);
      if (ratingMatch) {
        result.rating = extractRating(ratingMatch[1]);
      }
    }
    
    if (taskType === 'availability' || taskType === 'all') {
      result.inStock = !/Out of Stock/i.test(html);
    }
    
    return result;
  } catch (error) {
    throw new Error(`Meesho scraping error: ${error.message}`);
  }
};

module.exports = {
  scrapeProductData,
  scrapeAmazonData,
  scrapeFlipkartData,
  scrapeMyntraData,
  scrapeAjioData,
  scrapeNykaaData,
  scrapeMeeshoData
};















