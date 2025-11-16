const Product = require('../models/Product');
const AffiliateClick = require('../models/AffiliateClick');

// Helper function to normalize subcategory format
// Converts variations like "tshirts" to "t-shirts", "polo-shirts" to "polo-shirts", etc.
const normalizeSubcategory = (subcategory) => {
  if (!subcategory) return subcategory;
  
  const lower = subcategory.toLowerCase().trim();
  
  // Map common variations to standard format
  const mappings = {
    'tshirts': 't-shirts',
    'tshirt': 't-shirts',
    't shirt': 't-shirts',
    't-shirts': 't-shirts', // Already correct
    't-shirt': 't-shirts',
    'poloshirts': 'polo-shirts',
    'poloshirt': 'polo-shirts',
    'polo shirt': 'polo-shirts',
    'polo-shirts': 'polo-shirts', // Already correct
    'polo-shirt': 'polo-shirts',
    'formalshirts': 'formal-shirts',
    'formalshirt': 'formal-shirts',
    'formal shirt': 'formal-shirts',
    'formal-shirts': 'formal-shirts', // Already correct
    'formal-shirt': 'formal-shirts',
    'formalpants': 'formal-pants',
    'formalpant': 'formal-pants',
    'formal pant': 'formal-pants',
    'formal-pants': 'formal-pants', // Already correct
    'formal-pant': 'formal-pants',
    'cargopants': 'cargo-pants',
    'cargopant': 'cargo-pants',
    'cargo pant': 'cargo-pants',
    'cargo-pants': 'cargo-pants', // Already correct
    'cargo-pant': 'cargo-pants',
    'formalshoes': 'formal-shoes',
    'formalshoe': 'formal-shoes',
    'formal shoe': 'formal-shoes',
    'formal-shoes': 'formal-shoes', // Already correct
    'formal-shoe': 'formal-shoes',
    'boysclothing': 'boys-clothing',
    'boys clothing': 'boys-clothing',
    'boys-clothing': 'boys-clothing', // Already correct
    'girlsclothing': 'girls-clothing',
    'girls clothing': 'girls-clothing',
    'girls-clothing': 'girls-clothing', // Already correct
    'babyclothing': 'baby-clothing',
    'baby clothing': 'baby-clothing',
    'baby-clothing': 'baby-clothing', // Already correct
    'schoolsupplies': 'school-supplies',
    'school supplies': 'school-supplies',
    'school-supplies': 'school-supplies', // Already correct
  };
  
  return mappings[lower] || lower;
};
const axios = require('axios');

// Mock API responses for demonstration
const mockAmazonData = {
  "products": [
    {
      "name": "Men's Cotton T-Shirt",
      "price": 599,
      "originalPrice": 799,
      "discount": 25,
      "url": "https://amazon.in/mens-tshirt",
      "rating": 4.2,
      "reviews": 1250,
      "inStock": true
    }
  ]
};

const mockFlipkartData = {
  "products": [
    {
      "name": "Men's Cotton T-Shirt",
      "price": 549,
      "originalPrice": 699,
      "discount": 21,
      "url": "https://flipkart.com/mens-tshirt",
      "rating": 4.0,
      "reviews": 890,
      "inStock": true
    }
  ]
};

const mockMyntraData = {
  "products": [
    {
      "name": "Men's Cotton T-Shirt",
      "price": 699,
      "originalPrice": 999,
      "discount": 30,
      "url": "https://myntra.com/mens-tshirt",
      "rating": 4.5,
      "reviews": 2100,
      "inStock": true
    }
  ]
};

// Helper function to clean and escape words for regex
const cleanWordForRegex = (word) => {
  if (!word) return '';
  // Remove special characters that break word boundaries, but keep alphanumeric and some safe chars
  // Replace apostrophes, quotes, and other punctuation with spaces, then trim
  let cleaned = word.replace(/['"`]/g, ''); // Remove quotes and apostrophes
  // Escape regex special characters
  cleaned = cleaned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return cleaned;
};

// Search products across multiple platforms
  const searchProducts = async (req, res) => {
    try {
      const { query, category, subcategory, minPrice, maxPrice, sortBy, exclude, limit, website, trending, exactMatch } = req.query;
    
    // Build search criteria
    const searchCriteria = {};
    
    if (query) {
      searchCriteria.$text = { $search: query };
    }
    
    if (category) {
      searchCriteria.category = category.toLowerCase();
    }
    
    // Exclude specific product
    if (exclude) {
      searchCriteria._id = { $ne: exclude };
    }
    
          // Price filtering
          if (minPrice || maxPrice) {
            searchCriteria['prices.price'] = {};
            if (minPrice) searchCriteria['prices.price'].$gte = parseInt(minPrice);
            if (maxPrice) searchCriteria['prices.price'].$lte = parseInt(maxPrice);
          }

          // Website filtering - filter products that have prices from specific website
          if (website) {
            searchCriteria['prices.website'] = website.toLowerCase();
          }

          // Trending filtering
          if (trending === 'true' || trending === true) {
            searchCriteria.trending = true;
          }
    
    if (subcategory) {
      // Normalize subcategory to handle variations like "tshirts" vs "t-shirts"
      const normalizedSubcategory = normalizeSubcategory(subcategory);
      
      // Use case-insensitive regex for subcategory matching
      // Match both normalized form ("t-shirts") and original variations ("tshirts")
      const escapedSubcategory = normalizedSubcategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedOriginal = subcategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Use $or to match either the normalized form or original form (case-insensitive)
      const subcategoryCondition = {
        $or: [
          { subcategory: { $regex: new RegExp(`^${escapedSubcategory}$`, 'i') } },
          { subcategory: { $regex: new RegExp(`^${escapedOriginal}$`, 'i') } }
        ]
      };
      
      // If we have other top-level criteria (category, query, etc), combine with $and
      if (searchCriteria.category || searchCriteria.$text || searchCriteria._id || 
          searchCriteria['prices.price']) {
        if (!searchCriteria.$and) {
          // Move existing top-level criteria into $and array
          const existingCriteria = {};
          if (searchCriteria.category) existingCriteria.category = searchCriteria.category;
          if (searchCriteria.$text) existingCriteria.$text = searchCriteria.$text;
          if (searchCriteria._id) existingCriteria._id = searchCriteria._id;
          if (searchCriteria['prices.price']) existingCriteria['prices.price'] = searchCriteria['prices.price'];
          
          // Remove from top level
          delete searchCriteria.category;
          delete searchCriteria.$text;
          delete searchCriteria._id;
          delete searchCriteria['prices.price'];
          
          searchCriteria.$and = [existingCriteria, subcategoryCondition];
        } else {
          searchCriteria.$and.push(subcategoryCondition);
        }
      } else {
        // If only subcategory, use the $or directly
        Object.assign(searchCriteria, subcategoryCondition);
      }
    }
    
    // Sort options
    let sortOptions = {};
    // Default to rating sort when category/subcategory is selected OR when viewing all products (no filters)
    const hasCategoryFilter = category || subcategory;
    const hasNoFilters = !query && !category && !subcategory && !trending;
    
    if (sortBy === 'price-low') {
      sortOptions = { 'prices.price': 1 };
    } else if (sortBy === 'price-high') {
      sortOptions = { 'prices.price': -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { 'prices.rating': -1 };
    } else if ((hasCategoryFilter || hasNoFilters) && !sortBy) {
      // Default to rating sort for category views and "explore all products" view
      sortOptions = { 'prices.rating': -1 };
    } else {
      sortOptions = { updatedAt: -1 };
    }
    
    // If text search is used, we need to ensure the text index exists
    // For now, if text search is used and fails, fall back to regex search
    let products = [];
    
    try {
      const limitValue = limit ? parseInt(limit) : 1000;
      
      // Log search criteria for debugging (better format for regex)
      const logCriteria = { ...searchCriteria };
      if (logCriteria.$and) {
        logCriteria.$and = logCriteria.$and.map(condition => {
          if (condition.$or) {
            return {
              $or: condition.$or.map(sub => {
                if (sub.subcategory && sub.subcategory.$regex) {
                  return { subcategory: sub.subcategory.$regex.toString() };
                }
                return sub;
              })
            };
          }
          return condition;
        });
      }
      console.log('Search Criteria:', JSON.stringify(logCriteria, null, 2));
      console.log('Search Params - Category:', category || 'all', 'Subcategory:', subcategory || 'all');
      
      // If query is provided, use regex search for description, brand, category, subcategory, and name
      if (query) {
        // If exactMatch is true (admin panel), try exact title match first
        if (exactMatch === 'true') {
          // First, try exact case-insensitive match on product name
          const exactMatchCriteria = {};
          
          // Escape special regex characters in query
          const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          exactMatchCriteria.name = { $regex: `^${escapedQuery}$`, $options: 'i' };
          
          // If category is specified, include it in exact match
          if (category) {
            exactMatchCriteria.category = category.toLowerCase();
          }
          
          // Include other filters (price, website, etc.)
          if (searchCriteria['prices.price']) {
            exactMatchCriteria['prices.price'] = searchCriteria['prices.price'];
          }
          if (searchCriteria['prices.website']) {
            exactMatchCriteria['prices.website'] = searchCriteria['prices.website'];
          }
          if (searchCriteria.trending !== undefined) {
            exactMatchCriteria.trending = searchCriteria.trending;
          }
          
          // Try exact match first
          let exactProducts = await Product.find(exactMatchCriteria).limit(limitValue);
          
          // If exact match found, return only those products
          if (exactProducts.length > 0) {
            // Convert to plain objects and normalize price values
            exactProducts = exactProducts.map(product => {
              const productObj = product.toObject ? product.toObject() : { ...product };
              if (productObj.prices && productObj.prices.length > 0) {
                productObj.prices = productObj.prices.map(price => {
                  const priceObj = price.toObject ? price.toObject() : { ...price };
                  const normalizeNumber = (value) => {
                    if (value == null) return undefined;
                    if (typeof value === 'number') return value;
                    if (typeof value === 'object') {
                      return value.$numberInt || value.$numberDouble || value.$numberLong || value;
                    }
                    return Number(value);
                  };
                  
                  return {
                    website: priceObj.website,
                    price: normalizeNumber(priceObj.price),
                    originalPrice: normalizeNumber(priceObj.originalPrice),
                    discount: normalizeNumber(priceObj.discount),
                    url: priceObj.url,
                    inStock: priceObj.inStock !== false,
                    rating: normalizeNumber(priceObj.rating),
                    reviews: normalizeNumber(priceObj.reviews),
                    lastUpdated: priceObj.lastUpdated || new Date()
                  };
                });
                productObj.prices.sort((a, b) => a.price - b.price);
              }
              return productObj;
            });
            
            // Apply price filter if specified
            if (minPrice || maxPrice) {
              exactProducts = exactProducts.filter(product => {
                if (!product.prices || product.prices.length === 0) return false;
                const prices = product.prices.map(p => p.price).filter(p => p != null);
                if (prices.length === 0) return false;
                const minProductPrice = Math.min(...prices);
                const maxProductPrice = Math.max(...prices);
                if (minPrice && maxProductPrice < parseInt(minPrice)) return false;
                if (maxPrice && minProductPrice > parseInt(maxPrice)) return false;
                return true;
              });
            }
            
            return res.json({
              success: true,
              data: exactProducts,
              count: exactProducts.length
            });
          }
          // If no exact match, continue with normal search but prioritize close matches
        }
        
        // Normalize the query to handle subcategory variations (e.g., "tshirt" -> "t-shirts")
        const normalizedQuery = normalizeSubcategory(query);
        const queryLower = query.toLowerCase().trim();
        const normalizedLower = normalizedQuery.toLowerCase().trim();
        
        // Split query into individual words for word-by-word matching
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
        const normalizedWords = normalizedLower.split(/\s+/).filter(w => w.length > 0);
        
        // Build search conditions - prioritize word-by-word matches
        const searchConditions = {
          $or: []
        };
        
        // Add word-by-word search conditions for each word
        queryWords.forEach(word => {
          // Clean the word first - remove problematic characters
          const cleanedWord = word.replace(/['"`&()]/g, '').trim();
          if (!cleanedWord || cleanedWord.length === 0) return; // Skip empty words
          
          const wordEscaped = cleanWordForRegex(cleanedWord);
          const flexibleWord = cleanedWord.replace(/[-\s]/g, '[-\s]*');
          
          // Only use word boundaries if the word is alphanumeric
          const isAlphanumeric = /^[a-z0-9]+$/i.test(cleanedWord);
          const regexPattern = isAlphanumeric ? `\\b${wordEscaped}\\b` : wordEscaped;
          
          searchConditions.$or.push(
            { name: { $regex: regexPattern, $options: 'i' } }, // Word boundary match in name
            { description: { $regex: regexPattern, $options: 'i' } }, // Word boundary match in description
            { brand: { $regex: regexPattern, $options: 'i' } }, // Word boundary match in brand
            { category: { $regex: wordEscaped, $options: 'i' } },
            { subcategory: { $regex: wordEscaped, $options: 'i' } },
            { subcategory: { $regex: flexibleWord, $options: 'i' } } // Flexible match for subcategory
          );
        });
        
        // Also add normalized word matches
        normalizedWords.forEach(word => {
          if (!queryWords.includes(word)) {
            // Clean the word first
            const cleanedWord = word.replace(/['"`&()]/g, '').trim();
            if (!cleanedWord || cleanedWord.length === 0) return; // Skip empty words
            
            const wordEscaped = cleanWordForRegex(cleanedWord);
            const flexibleWord = cleanedWord.replace(/[-\s]/g, '[-\s]*');
            
            // Only use word boundaries if the word is alphanumeric
            const isAlphanumeric = /^[a-z0-9]+$/i.test(cleanedWord);
            const regexPattern = isAlphanumeric ? `\\b${wordEscaped}\\b` : wordEscaped;
            
            searchConditions.$or.push(
              { name: { $regex: regexPattern, $options: 'i' } },
              { description: { $regex: regexPattern, $options: 'i' } },
              { brand: { $regex: regexPattern, $options: 'i' } },
              { subcategory: { $regex: wordEscaped, $options: 'i' } },
              { subcategory: { $regex: flexibleWord, $options: 'i' } }
            );
          }
        });
        
        // Also add full phrase matches (for when user types multiple words)
        if (queryWords.length > 1) {
          // Clean the full phrase - escape regex special chars but keep spaces
          const fullPhrase = queryLower
            .replace(/['"`]/g, '') // Remove quotes and apostrophes
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
          if (fullPhrase.trim().length > 0) {
            searchConditions.$or.push(
              { name: { $regex: fullPhrase, $options: 'i' } },
              { description: { $regex: fullPhrase, $options: 'i' } },
              { brand: { $regex: fullPhrase, $options: 'i' } }
            );
          }
        }
        
        // Combine with other filters using $and
        const combinedCriteria = {};
        const otherConditions = {};
        
        // Collect other conditions
        if (searchCriteria.category) otherConditions.category = searchCriteria.category;
        if (searchCriteria._id) otherConditions._id = searchCriteria._id;
        if (searchCriteria['prices.price']) otherConditions['prices.price'] = searchCriteria['prices.price'];
        if (searchCriteria['prices.website']) otherConditions['prices.website'] = searchCriteria['prices.website'];
        
        // Handle subcategory condition
        if (searchCriteria.$and) {
          otherConditions.$and = searchCriteria.$and;
        }
        
        // Combine conditions
        if (Object.keys(otherConditions).length > 0 || searchCriteria.$and) {
          combinedCriteria.$and = [
            searchConditions,
            ...(searchCriteria.$and || []),
            ...(Object.keys(otherConditions).length > 0 ? [otherConditions] : [])
          ].filter(c => c && Object.keys(c).length > 0);
        } else {
          Object.assign(combinedCriteria, searchConditions);
        }
        
        // Fetch products with search criteria
        products = await Product.find(combinedCriteria)
          .limit(limitValue);
        
        // Sort products by relevance - prioritize word-by-word matches at the top
        if (queryWords.length > 0) {
          // Calculate relevance score for each product
          const getRelevanceScore = (product) => {
            let score = 0;
            const nameLower = (product.name || '').toLowerCase();
            const descLower = (product.description || '').toLowerCase();
            const brandLower = (product.brand || '').toLowerCase();
            const subcatLower = (product.subcategory || '').toLowerCase();
            
            queryWords.forEach(word => {
              // Clean the word first
              const cleanedWord = word.replace(/['"`&()]/g, '').trim();
              if (!cleanedWord || cleanedWord.length === 0) return; // Skip empty words
              
              const escapedWord = cleanWordForRegex(cleanedWord);
              
              // Only use word boundaries if the word is alphanumeric
              const isAlphanumeric = /^[a-z0-9]+$/i.test(cleanedWord);
              const regexPattern = isAlphanumeric ? `\\b${escapedWord}\\b` : escapedWord;
              const wordRegex = new RegExp(regexPattern, 'i');
              const cleanedWordLower = cleanedWord.toLowerCase();
              
              if (wordRegex.test(nameLower)) {
                // If word appears at the start of name, give even more points
                if (nameLower.startsWith(cleanedWordLower) || nameLower.startsWith(cleanedWordLower + ' ')) {
                  score += 20; // Highest priority: word at start of name
                } else {
                  score += 15; // High priority: word in name
                }
              }
              
              // Word matches in brand (important but not as much as name)
              if (wordRegex.test(brandLower)) {
                score += 12;
              }
              
              // Word matches in subcategory
              if (wordRegex.test(subcatLower)) {
                score += 10;
              }
              
              // Word matches in description (lower priority)
              if (wordRegex.test(descLower)) {
                score += 5;
              }
              
              // Partial matches (substring) get lower priority
              if (nameLower.includes(cleanedWordLower) && !wordRegex.test(nameLower)) {
                score += 4; // Partial match in name
              }
              if (brandLower.includes(cleanedWordLower) && !wordRegex.test(brandLower)) {
                score += 3; // Partial match in brand
              }
              if (subcatLower.includes(cleanedWordLower) && !wordRegex.test(subcatLower)) {
                score += 2; // Partial match in subcategory
              }
              if (descLower.includes(cleanedWordLower) && !wordRegex.test(descLower)) {
                score += 1; // Partial match in description
              }
            });
            
            return score;
          };
          
          // Calculate and store relevance scores and max ratings
          products = products.map(product => {
            const productObj = product.toObject ? product.toObject() : { ...product };
            productObj._relevanceScore = getRelevanceScore(productObj);
            // Calculate max rating from all prices for rating-based sorting
            if (sortOptions['prices.rating']) {
              const ratings = (productObj.prices || [])
                .map(p => p.rating)
                .filter(r => r != null && !isNaN(r));
              productObj._maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;
            }
            return productObj;
          });
          
          // Sort by relevance score first (highest first), then by user's sort preference
          products.sort((a, b) => {
            // Primary sort: by relevance score (highest first)
            if (b._relevanceScore !== a._relevanceScore) {
              return b._relevanceScore - a._relevanceScore;
            }
            
            // Secondary sort: if relevance is same, apply user's sort preference
            if (sortOptions['prices.price']) {
              const aPrice = a.prices?.[0]?.price || 0;
              const bPrice = b.prices?.[0]?.price || 0;
              return sortOptions['prices.price'] === 1 ? aPrice - bPrice : bPrice - aPrice;
            } else if (sortOptions['prices.rating']) {
              // Use max rating instead of first price rating
              const aRating = a._maxRating || 0;
              const bRating = b._maxRating || 0;
              return sortOptions['prices.rating'] === -1 ? bRating - aRating : aRating - bRating;
            } else if (sortOptions.updatedAt) {
              const aDate = new Date(a.updatedAt || 0);
              const bDate = new Date(b.updatedAt || 0);
              return sortOptions.updatedAt === -1 ? bDate - aDate : aDate - bDate;
            }
            return 0;
          });
          
          // Remove temporary properties
          products = products.map(product => {
            delete product._relevanceScore;
            if (product._maxRating !== undefined) {
              delete product._maxRating;
            }
            return product;
          });
        } else {
          // No query words, apply sort options directly
          // Calculate max rating for each product if sorting by rating
          if (sortOptions['prices.rating']) {
            products = products.map(product => {
              const productObj = product.toObject ? product.toObject() : { ...product };
              const ratings = (productObj.prices || [])
                .map(p => p.rating)
                .filter(r => r != null && !isNaN(r));
              productObj._maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;
              return productObj;
            });
          }
          
          products = products.sort((a, b) => {
            if (sortOptions['prices.price']) {
              const aPrice = a.prices?.[0]?.price || 0;
              const bPrice = b.prices?.[0]?.price || 0;
              return sortOptions['prices.price'] === 1 ? aPrice - bPrice : bPrice - aPrice;
            } else if (sortOptions['prices.rating']) {
              // Use max rating instead of first price rating
              const aRating = a._maxRating || 0;
              const bRating = b._maxRating || 0;
              return sortOptions['prices.rating'] === -1 ? bRating - aRating : aRating - bRating;
            } else if (sortOptions.updatedAt) {
              const aDate = new Date(a.updatedAt || 0);
              const bDate = new Date(b.updatedAt || 0);
              return sortOptions.updatedAt === -1 ? bDate - aDate : aDate - bDate;
            }
            return 0;
          });
          
          // Remove temporary maxRating property if it was added
          if (sortOptions['prices.rating']) {
            products = products.map(product => {
              delete product._maxRating;
              return product;
            });
          }
        }
      } else {
        // No query, use regular search criteria
        // If sorting by rating, we need to fetch all and sort in JavaScript
        // because MongoDB can't easily sort by max value in nested array
        if (sortOptions['prices.rating']) {
          products = await Product.find(searchCriteria)
            .limit(limitValue);
          
          // Calculate max rating for each product and sort
          products = products.map(product => {
            const productObj = product.toObject ? product.toObject() : { ...product };
            // Calculate max rating from all prices
            const ratings = (productObj.prices || [])
              .map(p => p.rating)
              .filter(r => r != null && !isNaN(r));
            productObj._maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;
            return productObj;
          });
          
          // Sort by max rating (descending)
          products.sort((a, b) => b._maxRating - a._maxRating);
          
          // Remove temporary property
          products = products.map(product => {
            delete product._maxRating;
            return product;
          });
        } else {
          products = await Product.find(searchCriteria)
            .sort(sortOptions)
            .limit(limitValue);
        }
      }
      
      // Log found products count
      const categoryLabel = category || 'all';
      const subcategoryLabel = subcategory || 'all';
      const productCount = products.length;
      console.log(`Found ${productCount} product${productCount !== 1 ? 's' : ''} for category: ${categoryLabel}, subcategory: ${subcategoryLabel}, query: ${query || 'none'}`);
      
      // Populate prices array and ensure it's sorted
      // Convert MongoDB documents to plain objects and normalize price values
      products = products.map(product => {
        const productObj = product.toObject ? product.toObject() : { ...product };
        if (productObj.prices && productObj.prices.length > 0) {
          productObj.prices = productObj.prices.map(price => {
            const priceObj = price.toObject ? price.toObject() : { ...price };
            // Handle MongoDB extended JSON format ($numberInt, $numberDouble)
            const normalizeNumber = (value) => {
              if (value == null) return undefined;
              if (typeof value === 'number') return value;
              if (typeof value === 'object') {
                return value.$numberInt || value.$numberDouble || value.$numberLong || value;
              }
              return Number(value);
            };
            
            return {
              website: priceObj.website,
              price: normalizeNumber(priceObj.price),
              originalPrice: normalizeNumber(priceObj.originalPrice),
              discount: normalizeNumber(priceObj.discount),
              url: priceObj.url,
              inStock: priceObj.inStock !== false,
              rating: normalizeNumber(priceObj.rating),
              reviews: normalizeNumber(priceObj.reviews),
              lastUpdated: priceObj.lastUpdated || new Date()
            };
          });
          productObj.prices.sort((a, b) => a.price - b.price);
        }
        return productObj;
      });
      
    } catch (error) {
      // If search fails, try regex search as fallback
      console.error('Search error, trying fallback regex search:', error.message);
      const regexCriteria = { ...searchCriteria };
      delete regexCriteria.$text;
      
      if (query) {
        // Normalize the query to handle subcategory variations
        const normalizedQuery = normalizeSubcategory(query);
        const queryLower = query.toLowerCase().trim();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
        const normalizedWords = normalizedQuery.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
        
        // Build word-by-word search conditions
        const searchConditions = {
          $or: []
        };
        
        // Add word-by-word search conditions
        queryWords.forEach(word => {
          // Clean the word first - remove problematic characters
          const cleanedWord = word.replace(/['"`&()]/g, '').trim();
          if (!cleanedWord || cleanedWord.length === 0) return; // Skip empty words
          
          const wordEscaped = cleanWordForRegex(cleanedWord);
          const flexibleWord = cleanedWord.replace(/[-\s]/g, '[-\s]*');
          
          // Only use word boundaries if the word is alphanumeric
          const isAlphanumeric = /^[a-z0-9]+$/i.test(cleanedWord);
          const regexPattern = isAlphanumeric ? `\\b${wordEscaped}\\b` : wordEscaped;
          
          searchConditions.$or.push(
            { name: { $regex: regexPattern, $options: 'i' } },
            { description: { $regex: regexPattern, $options: 'i' } },
            { brand: { $regex: regexPattern, $options: 'i' } },
            { category: { $regex: wordEscaped, $options: 'i' } },
            { subcategory: { $regex: wordEscaped, $options: 'i' } },
            { subcategory: { $regex: flexibleWord, $options: 'i' } }
          );
        });
        
        // Add normalized word matches
        normalizedWords.forEach(word => {
          if (!queryWords.includes(word)) {
            // Clean the word first
            const cleanedWord = word.replace(/['"`&()]/g, '').trim();
            if (!cleanedWord || cleanedWord.length === 0) return; // Skip empty words
            
            const wordEscaped = cleanWordForRegex(cleanedWord);
            const flexibleWord = cleanedWord.replace(/[-\s]/g, '[-\s]*');
            
            // Only use word boundaries if the word is alphanumeric
            const isAlphanumeric = /^[a-z0-9]+$/i.test(cleanedWord);
            const regexPattern = isAlphanumeric ? `\\b${wordEscaped}\\b` : wordEscaped;
            
            searchConditions.$or.push(
              { name: { $regex: regexPattern, $options: 'i' } },
              { description: { $regex: regexPattern, $options: 'i' } },
              { brand: { $regex: regexPattern, $options: 'i' } },
              { subcategory: { $regex: wordEscaped, $options: 'i' } },
              { subcategory: { $regex: flexibleWord, $options: 'i' } }
            );
          }
        });
        
        // Combine with other filters
        if (regexCriteria.category || regexCriteria['prices.price'] || regexCriteria['prices.website'] || regexCriteria.$and) {
          if (!regexCriteria.$and) {
            regexCriteria.$and = [];
          }
          regexCriteria.$and.push(searchConditions);
        } else {
          Object.assign(regexCriteria, searchConditions);
        }
      }
      
      const limitValue = limit ? parseInt(limit) : 1000;
      // If sorting by rating, fetch without sort and sort in JavaScript
      if (sortOptions['prices.rating']) {
        products = await Product.find(regexCriteria)
          .limit(limitValue);
      } else {
        products = await Product.find(regexCriteria)
          .sort(sortOptions)
          .limit(limitValue);
      }
      
      // Convert to plain objects and normalize price values
      products = products.map(product => {
        const productObj = product.toObject ? product.toObject() : product;
        if (productObj.prices && productObj.prices.length > 0) {
          productObj.prices = productObj.prices.map(price => {
            const priceObj = price.toObject ? price.toObject() : price;
            const normalizeNumber = (value) => {
              if (value == null) return undefined;
              if (typeof value === 'number') return value;
              if (typeof value === 'object') {
                return value.$numberInt || value.$numberDouble || value.$numberLong || value;
              }
              return Number(value);
            };
            return {
              website: priceObj.website,
              price: normalizeNumber(priceObj.price),
              originalPrice: normalizeNumber(priceObj.originalPrice),
              discount: normalizeNumber(priceObj.discount),
              url: priceObj.url,
              inStock: priceObj.inStock !== false,
              rating: normalizeNumber(priceObj.rating),
              reviews: normalizeNumber(priceObj.reviews),
              lastUpdated: priceObj.lastUpdated || new Date()
            };
          });
          productObj.prices.sort((a, b) => a.price - b.price);
        }
        // Calculate max rating for sorting
        if (sortOptions['prices.rating']) {
          const ratings = (productObj.prices || [])
            .map(p => p.rating)
            .filter(r => r != null && !isNaN(r));
          productObj._maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;
        }
        return productObj;
      });
      
      // Sort by max rating if needed
      if (sortOptions['prices.rating']) {
        products.sort((a, b) => (b._maxRating || 0) - (a._maxRating || 0));
        // Remove temporary property
        products = products.map(product => {
          delete product._maxRating;
          return product;
        });
      }
    }
    
    // Log final products structure before sending
    if (products.length > 0) {
      console.log('Sample product structure:', {
        _id: products[0]._id,
        name: products[0].name,
        pricesCount: products[0].prices?.length,
        firstPrice: products[0].prices?.[0],
        priceType: typeof products[0].prices?.[0]?.price
      });
    }
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
    } catch (error) {
      console.error('Error in searchProducts:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error searching products',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
};

// Get product details with price comparison
const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Sort prices by current price
    product.prices.sort((a, b) => a.price - b.price);
    
    // Get similar products - same category and subcategory
    let similarProducts = await Product.find({
      category: product.category,
      subcategory: product.subcategory,
      _id: { $ne: productId }
    })
    .limit(12)
    .sort({ updatedAt: -1 });
    
    // Filter by similar price range if product has prices
    if (product.prices && product.prices.length > 0) {
      const minPrice = Math.min(...product.prices.map(p => p.price));
      const maxPrice = Math.max(...product.prices.map(p => p.price));
      
      // Filter products with similar prices (within 30% range)
      similarProducts = similarProducts.filter(p => {
        if (!p.prices || p.prices.length === 0) return false;
        const productMinPrice = Math.min(...p.prices.map(pr => pr.price));
        const productMaxPrice = Math.max(...p.prices.map(pr => pr.price));
        return (productMinPrice >= minPrice * 0.7 && productMinPrice <= maxPrice * 1.3) ||
               (productMaxPrice >= minPrice * 0.7 && productMaxPrice <= maxPrice * 1.3);
      });
      
      // Sort by name similarity
      if (similarProducts.length > 0) {
        similarProducts.sort((a, b) => {
          const productNameWords = product.name.toLowerCase().split(' ');
          const aMatches = productNameWords.filter(word => 
            a.name.toLowerCase().includes(word)
          ).length;
          const bMatches = productNameWords.filter(word => 
            b.name.toLowerCase().includes(word)
          ).length;
          return bMatches - aMatches;
        });
      }
    }
    
    // Limit to 6 best matches
    similarProducts = similarProducts.slice(0, 6);
    
    // Also get products with similarProductIds if they exist
    if (product.similarProductIds && product.similarProductIds.length > 0) {
      const linkedSimilar = await Product.find({
        _id: { $in: product.similarProductIds }
      });
      similarProducts = [...similarProducts, ...linkedSimilar];
    }
    
    res.json({
      success: true,
      data: product,
      similarProducts: similarProducts,
      isCrossLocation: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product details',
      error: error.message
    });
  }
};

// Fetch real-time prices from external APIs
const fetchRealTimePrices = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update prices with existing product prices or keep current
    // No affiliate API calls - just use existing prices
    try {
      // Keep existing prices, just update the timestamp
      if (product.prices && product.prices.length > 0) {
        product.prices = product.prices.map(price => ({
          ...price,
          lastUpdated: new Date()
        }));
        
        product.updatedAt = new Date();
        await product.save();
        
        res.json({
          success: true,
          data: product,
          message: 'Prices refreshed successfully'
        });
      } else {
        // If no prices exist, use mock data
        const updatedPrices = [];
        
        // Simulate Amazon API call
        try {
          const amazonData = mockAmazonData.products[0];
          updatedPrices.push({
            website: 'amazon',
            price: amazonData.price,
            originalPrice: amazonData.originalPrice,
            discount: amazonData.discount,
            url: amazonData.url,
            inStock: amazonData.inStock,
            rating: amazonData.rating,
            reviews: amazonData.reviews,
            lastUpdated: new Date()
          });
        } catch (error) {
          console.log('Amazon API error:', error.message);
        }
        
        // Simulate Flipkart API call
        try {
          const flipkartData = mockFlipkartData.products[0];
          updatedPrices.push({
            website: 'flipkart',
            price: flipkartData.price,
            originalPrice: flipkartData.originalPrice,
            discount: flipkartData.discount,
            url: flipkartData.url,
            inStock: flipkartData.inStock,
            rating: flipkartData.rating,
            reviews: flipkartData.reviews,
            lastUpdated: new Date()
          });
        } catch (error) {
          console.log('Flipkart API error:', error.message);
        }
        
        // Simulate Myntra API call
        try {
          const myntraData = mockMyntraData.products[0];
          updatedPrices.push({
            website: 'myntra',
            price: myntraData.price,
            originalPrice: myntraData.originalPrice,
            discount: myntraData.discount,
            url: myntraData.url,
            inStock: myntraData.inStock,
            rating: myntraData.rating,
            reviews: myntraData.reviews,
            lastUpdated: new Date()
          });
        } catch (error) {
          console.log('Myntra API error:', error.message);
        }
        
        product.prices = updatedPrices;
        product.updatedAt = new Date();
        await product.save();
        
        res.json({
          success: true,
          data: product,
          message: 'Prices updated with mock data'
        });
      }
    } catch (error) {
      console.error('Price refresh error:', error);
      
      // Return existing prices
      res.json({
        success: true,
        data: product,
        message: 'Using existing prices'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching real-time prices',
      error: error.message
    });
  }
};

// Get categories and subcategories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const subcategories = await Product.distinct('subcategory');
    
    res.json({
      success: true,
      data: {
        categories,
        subcategories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Add new product (for admin purposes)
const addProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Remove location field if present (no longer needed)
    if (productData.location) {
      delete productData.location;
    }
    
    // Normalize category and subcategory to lowercase for consistency
    if (productData.category) {
      productData.category = productData.category.toLowerCase();
    }
    if (productData.subcategory) {
      // Normalize subcategory format (e.g., "tshirts" -> "t-shirts")
      productData.subcategory = normalizeSubcategory(productData.subcategory.toLowerCase());
    }
    
    // Ensure prices array has URLs
    if (productData.prices && Array.isArray(productData.prices)) {
      productData.prices = productData.prices.map(price => ({
        ...price,
        url: price.url || '', // Use provided URL
        lastUpdated: new Date()
      }));
    }
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding product',
      error: error.message
    });
  }
};

// Update product (for admin purposes)
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const productData = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Remove location field if present (no longer needed)
    if (productData.location) {
      delete productData.location;
    }
    
    // Normalize category and subcategory to lowercase for consistency
    if (productData.category) {
      productData.category = productData.category.toLowerCase();
    }
    if (productData.subcategory) {
      // Normalize subcategory format (e.g., "tshirts" -> "t-shirts")
      productData.subcategory = normalizeSubcategory(productData.subcategory.toLowerCase());
    }
    
    // Ensure prices array has URLs and lastUpdated
    if (productData.prices && Array.isArray(productData.prices)) {
      productData.prices = productData.prices.map(price => ({
        ...price,
        url: price.url || '',
        lastUpdated: new Date()
      }));
    }
    
    // Update updatedAt timestamp
    productData.updatedAt = new Date();
    
    const product = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check price alerts for this product after update
    const { checkPriceAlerts } = require('../helpers/check-price-alerts');
    checkPriceAlerts(productId).catch(err => {
      console.error('Error checking price alerts after product update:', err);
      // Don't fail the update if alert check fails
    });
    
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product (for admin purposes)
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const product = await Product.findByIdAndDelete(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: { id: productId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Get similar products
const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.query;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find similar products - same category and subcategory
    const similarProducts = await Product.find({
      category: product.category,
      subcategory: product.subcategory,
      _id: { $ne: productId }
    })
    .limit(12)
    .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching similar products',
      error: error.message
    });
  }
};

// Track affiliate link click
const trackAffiliateClick = async (req, res) => {
  try {
    const { productId, productName, website, affiliateUrl, country, countryCode, userAgent } = req.body;
    
    if (!productId || !website || !affiliateUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, website, affiliateUrl'
      });
    }

    // Get IP address from request
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const clickData = {
      productId,
      productName: productName || 'Unknown',
      website,
      affiliateUrl,
      country: country || 'Unknown',
      countryCode: countryCode || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || req.headers['user-agent'] || null,
      clickedAt: new Date()
    };

    const affiliateClick = new AffiliateClick(clickData);
    await affiliateClick.save();

    res.status(200).json({
      success: true,
      message: 'Affiliate click tracked successfully',
      data: affiliateClick
    });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking affiliate click',
      error: error.message
    });
  }
};

// Get affiliate click statistics (admin)
const getAffiliateStats = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Default to last 30 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get total clicks
    const totalClicks = await AffiliateClick.countDocuments({
      clickedAt: { $gte: startDate }
    });

    // Get clicks by country
    const clicksByCountry = await AffiliateClick.aggregate([
      {
        $match: {
          clickedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          countryCode: { $first: '$countryCode' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get clicks by website
    const clicksByWebsite = await AffiliateClick.aggregate([
      {
        $match: {
          clickedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$website',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get clicks by product (top 10)
    const clicksByProduct = await AffiliateClick.aggregate([
      {
        $match: {
          clickedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$productId',
          productName: { $first: '$productName' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get recent clicks
    const recentClicks = await AffiliateClick.find({
      clickedAt: { $gte: startDate }
    })
    .sort({ clickedAt: -1 })
    .limit(50)
    .populate('productId', 'name image')
    .select('productName website country countryCode clickedAt');

    res.status(200).json({
      success: true,
      data: {
        totalClicks,
        clicksByCountry,
        clicksByWebsite,
        clicksByProduct,
        recentClicks,
        period: {
          days: parseInt(days),
          startDate,
          endDate: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliate statistics',
      error: error.message
    });
  }
};

module.exports = {
  searchProducts,
  getProductDetails,
  fetchRealTimePrices,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts,
  trackAffiliateClick,
  getAffiliateStats
};
