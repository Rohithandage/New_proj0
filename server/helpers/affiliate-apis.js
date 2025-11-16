// Affiliate API Integration for different e-commerce platforms
const axios = require('axios');

// Amazon Affiliate API (Amazon Product Advertising API)
// const amazonConfig = {
//   accessKey: process.env.AMAZON_ACCESS_KEY,
//   secretKey: process.env.AMAZON_SECRET_KEY,
//   associateTag: process.env.AMAZON_ASSOCIATE_TAG,
//   endpoint: 'https://webservices.amazon.com/paapi5/searchitems'
// };




const amazonConfig = {
  accessKey: "DEMO_ACCESS_KEY_12345",
  secretKey: "DEMO_SECRET_KEY_ABCDE",
  associateTag: "demoaffiliate-21",
  endpoint: "https://dummyjson.com/products/category/mens-shirts" // Trial endpoint
};


// Flipkart Affiliate API
const flipkartConfig = {
  apiKey: process.env.FLIPKART_API_KEY,
  endpoint: 'https://affiliate-api.flipkart.net/affiliate/api'
};

// Myntra Affiliate API
const myntraConfig = {
  apiKey: process.env.MYNTRA_API_KEY,
  endpoint: 'https://api.myntra.com/v1/products'
};

// Ajio Affiliate API
const ajioConfig = {
  apiKey: process.env.AJIO_API_KEY,
  endpoint: 'https://api.ajio.com/v1/products'
};

// Nykaa Affiliate API
const nykaaConfig = {
  apiKey: process.env.NYKAA_API_KEY,
  endpoint: 'https://api.nykaa.com/v1/products'
};

// Meesho Affiliate API
const meeshoConfig = {
  apiKey: process.env.MEESHO_API_KEY,
  endpoint: 'https://api.meesho.com/v1/products'
};

// Demo mode helper: when API keys are missing, return realistic mock data
const isDemoEnabled = () => {
  return !(
    amazonConfig.accessKey && amazonConfig.secretKey && amazonConfig.associateTag &&
    flipkartConfig.apiKey && process.env.FLIPKART_AFFILIATE_TOKEN
  );
};

const buildDemoItems = (website, query = '', category = 'men') => {
  const now = Date.now();
  const base = (name, price, mrp, image) => ({
    name,
    price,
    originalPrice: mrp,
    discount: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    url: `https://${website}.demo/product/${encodeURIComponent(name)}`,
    image,
    inStock: true,
    rating: 4 + Math.random() * 1,
    reviews: Math.floor(100 + Math.random() * 2000),
    website,
    affiliateUrl: generateAffiliateUrl(`https://${website}.demo/product/${encodeURIComponent(name)}`, website),
    ts: now
  });

  const images = {
    men: [
      'https://images.unsplash.com/photo-1520975931906-6d8a432f6a03?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&h=600&fit=crop'
    ],
    women: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=600&fit=crop'
    ],
    kids: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1440288736878-766bd5839edb?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519455953755-af066f52f1ea?w=600&h=600&fit=crop'
    ]
  };

  const cat = ['men', 'women', 'kids'].includes(category) ? category : 'men';

  const catalog = {
    men: [
      ['Formal Shirt', 1299, 1699],
      ['Cotton T-Shirt', 599, 799],
      ['Kurta', 999, 1299]
    ],
    women: [
      ['Summer Dress', 1399, 1799],
      ['Designer Top', 899, 1199],
      ['Kurtas', 1299, 1699]
    ],
    kids: [
      ['Boys Jeans', 799, 999],
      ['Girls Dress', 699, 899],
      ['T-Shirt', 399, 599]
    ]
  };

  const list = catalog[cat].map((row, i) => {
    const [n, p, mrp] = row;
    const name = `${query ? query + ' - ' : ''}${n}`;
    return base(name, p + Math.floor(Math.random() * 100), mrp, images[cat][i % images[cat].length]);
  });

  return list;
};

// Amazon Product Search
const searchAmazonProducts = async (query, category) => {
  try {
    if (isDemoEnabled()) {
      return buildDemoItems('amazon', query, category);
    }
    const params = {
      PartnerTag: amazonConfig.associateTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.in',
      SearchIndex: getAmazonSearchIndex(category),
      Keywords: query,
      ItemCount: 10,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.Availability',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ]
    };

    const response = await axios.post(amazonConfig.endpoint, params, {
      headers: {
        'Content-Type': 'application/json',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
      }
    });

    return formatAmazonResponse(response.data);
  } catch (error) {
    console.error('Amazon API Error:', error.message);
    return [];
  }
};

// Flipkart Product Search
const searchFlipkartProducts = async (query, category) => {
  try {
    if (!flipkartConfig.apiKey || isDemoEnabled()) {
      return buildDemoItems('flipkart', query, category);
    }
    const response = await axios.get(`${flipkartConfig.endpoint}/search`, {
      params: {
        query: query,
        category: category,
        count: 10
      },
      headers: {
        'Fk-Affiliate-Id': flipkartConfig.apiKey,
        'Fk-Affiliate-Token': process.env.FLIPKART_AFFILIATE_TOKEN
      }
    });

    return formatFlipkartResponse(response.data);
  } catch (error) {
    console.error('Flipkart API Error:', error.message);
    return [];
  }
};

// Myntra Product Search
const searchMyntraProducts = async (query, category) => {
  try {
    if (!myntraConfig.apiKey || isDemoEnabled()) {
      return buildDemoItems('myntra', query, category);
    }
    const response = await axios.get(`${myntraConfig.endpoint}/search`, {
      params: {
        q: query,
        category: category,
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${myntraConfig.apiKey}`
      }
    });

    return formatMyntraResponse(response.data);
  } catch (error) {
    console.error('Myntra API Error:', error.message);
    return [];
  }
};

// Ajio Product Search
const searchAjioProducts = async (query, category) => {
  try {
    if (!ajioConfig.apiKey || isDemoEnabled()) {
      return buildDemoItems('ajio', query, category);
    }
    const response = await axios.get(`${ajioConfig.endpoint}/search`, {
      params: {
        query: query,
        category: category,
        limit: 10
      },
      headers: {
        'X-API-Key': ajioConfig.apiKey
      }
    });

    return formatAjioResponse(response.data);
  } catch (error) {
    console.error('Ajio API Error:', error.message);
    return [];
  }
};

// Nykaa Product Search
const searchNykaaProducts = async (query, category) => {
  try {
    if (!nykaaConfig.apiKey || isDemoEnabled()) {
      return buildDemoItems('nykaa', query, category);
    }
    const response = await axios.get(`${nykaaConfig.endpoint}/search`, {
      params: {
        q: query,
        category: category,
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${nykaaConfig.apiKey}`
      }
    });

    return formatNykaaResponse(response.data);
  } catch (error) {
    console.error('Nykaa API Error:', error.message);
    return [];
  }
};

// Meesho Product Search
const searchMeeshoProducts = async (query, category) => {
  try {
    if (!meeshoConfig.apiKey || isDemoEnabled()) {
      return buildDemoItems('meesho', query, category);
    }
    const response = await axios.get(`${meeshoConfig.endpoint}/search`, {
      params: {
        q: query,
        category: category,
        limit: 10
      },
      headers: {
        'X-API-Key': meeshoConfig.apiKey
      }
    });

    return formatMeeshoResponse(response.data);
  } catch (error) {
    console.error('Meesho API Error:', error.message);
    return [];
  }
};

// Helper function to get Amazon search index based on category
const getAmazonSearchIndex = (category) => {
  const searchIndexMap = {
    'men': 'Fashion',
    'women': 'Fashion',
    'kids': 'Fashion',
    'shoes': 'Shoes',
    'watches': 'Watches',
    'bags': 'Handbags'
  };
  return searchIndexMap[category] || 'Fashion';
};

// Format responses from different APIs
const formatAmazonResponse = (data) => {
  if (!data.SearchResult || !data.SearchResult.Items) return [];
  
  return data.SearchResult.Items.map(item => ({
    name: item.ItemInfo?.Title?.DisplayValue || 'N/A',
    price: parseFloat(item.Offers?.Listings?.[0]?.Price?.Amount || 0),
    originalPrice: parseFloat(item.Offers?.Listings?.[0]?.Price?.Amount || 0),
    discount: 0,
    url: item.DetailPageURL,
    image: item.Images?.Primary?.Large?.URL || '',
    inStock: item.Offers?.Listings?.[0]?.Availability?.IsInStock || false,
    rating: parseFloat(item.CustomerReviews?.StarRating?.Value || 0),
    reviews: parseInt(item.CustomerReviews?.Count || 0),
    website: 'amazon',
    affiliateUrl: generateAffiliateUrl(item.DetailPageURL, 'amazon')
  }));
};

const formatFlipkartResponse = (data) => {
  if (!data.productInfoList) return [];
  
  return data.productInfoList.map(product => ({
    name: product.productBaseInfo?.title || 'N/A',
    price: parseFloat(product.productBaseInfo?.flipkartSpecialPrice?.amount || 0),
    originalPrice: parseFloat(product.productBaseInfo?.flipkartSellingPrice?.amount || 0),
    discount: calculateDiscount(
      parseFloat(product.productBaseInfo?.flipkartSellingPrice?.amount || 0),
      parseFloat(product.productBaseInfo?.flipkartSpecialPrice?.amount || 0)
    ),
    url: product.productBaseInfo?.productUrl,
    image: product.productBaseInfo?.imageUrls?.unknown || '',
    inStock: product.productBaseInfo?.inStock || false,
    rating: parseFloat(product.productBaseInfo?.rating || 0),
    reviews: parseInt(product.productBaseInfo?.reviewCount || 0),
    website: 'flipkart',
    affiliateUrl: generateAffiliateUrl(product.productBaseInfo?.productUrl, 'flipkart')
  }));
};

const formatMyntraResponse = (data) => {
  if (!data.products) return [];
  
  return data.products.map(product => ({
    name: product.name || 'N/A',
    price: parseFloat(product.price || 0),
    originalPrice: parseFloat(product.mrp || 0),
    discount: calculateDiscount(parseFloat(product.mrp || 0), parseFloat(product.price || 0)),
    url: product.url,
    image: product.image || '',
    inStock: product.inStock || false,
    rating: parseFloat(product.rating || 0),
    reviews: parseInt(product.reviewCount || 0),
    website: 'myntra',
    affiliateUrl: generateAffiliateUrl(product.url, 'myntra')
  }));
};

const formatAjioResponse = (data) => {
  if (!data.products) return [];
  
  return data.products.map(product => ({
    name: product.name || 'N/A',
    price: parseFloat(product.price || 0),
    originalPrice: parseFloat(product.mrp || 0),
    discount: calculateDiscount(parseFloat(product.mrp || 0), parseFloat(product.price || 0)),
    url: product.url,
    image: product.image || '',
    inStock: product.inStock || false,
    rating: parseFloat(product.rating || 0),
    reviews: parseInt(product.reviewCount || 0),
    website: 'ajio',
    affiliateUrl: generateAffiliateUrl(product.url, 'ajio')
  }));
};

const formatNykaaResponse = (data) => {
  if (!data.products) return [];
  
  return data.products.map(product => ({
    name: product.name || 'N/A',
    price: parseFloat(product.price || 0),
    originalPrice: parseFloat(product.mrp || 0),
    discount: calculateDiscount(parseFloat(product.mrp || 0), parseFloat(product.price || 0)),
    url: product.url,
    image: product.image || '',
    inStock: product.inStock || false,
    rating: parseFloat(product.rating || 0),
    reviews: parseInt(product.reviewCount || 0),
    website: 'nykaa',
    affiliateUrl: generateAffiliateUrl(product.url, 'nykaa')
  }));
};

const formatMeeshoResponse = (data) => {
  if (!data.products) return [];
  
  return data.products.map(product => ({
    name: product.name || 'N/A',
    price: parseFloat(product.price || 0),
    originalPrice: parseFloat(product.mrp || 0),
    discount: calculateDiscount(parseFloat(product.mrp || 0), parseFloat(product.price || 0)),
    url: product.url,
    image: product.image || '',
    inStock: product.inStock || false,
    rating: parseFloat(product.rating || 0),
    reviews: parseInt(product.reviewCount || 0),
    website: 'meesho',
    affiliateUrl: generateAffiliateUrl(product.url, 'meesho')
  }));
};

// Generate affiliate URLs
const generateAffiliateUrl = (originalUrl, website) => {
  const affiliateParams = {
    amazon: 'tag=your-amazon-tag',
    flipkart: 'affid=your-flipkart-id',
    myntra: 'utm_source=your-myntra-id',
    ajio: 'affid=your-ajio-id',
    nykaa: 'utm_source=your-nykaa-id',
    meesho: 'affid=your-meesho-id'
  };

  if (!originalUrl) return originalUrl;
  
  const separator = originalUrl.includes('?') ? '&' : '?';
  return `${originalUrl}${separator}${affiliateParams[website]}`;
};

// Calculate discount percentage
const calculateDiscount = (originalPrice, currentPrice) => {
  if (originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Main function to search all platforms
const searchAllPlatforms = async (query, category) => {
  try {
    const [amazonResults, flipkartResults, myntraResults, ajioResults, nykaaResults, meeshoResults] = await Promise.allSettled([
      searchAmazonProducts(query, category),
      searchFlipkartProducts(query, category),
      searchMyntraProducts(query, category),
      searchAjioProducts(query, category),
      searchNykaaProducts(query, category),
      searchMeeshoProducts(query, category)
    ]);

    const allResults = [
      ...(amazonResults.status === 'fulfilled' ? amazonResults.value : []),
      ...(flipkartResults.status === 'fulfilled' ? flipkartResults.value : []),
      ...(myntraResults.status === 'fulfilled' ? myntraResults.value : []),
      ...(ajioResults.status === 'fulfilled' ? ajioResults.value : []),
      ...(nykaaResults.status === 'fulfilled' ? nykaaResults.value : []),
      ...(meeshoResults.status === 'fulfilled' ? meeshoResults.value : [])
    ];

    return allResults;
  } catch (error) {
    console.error('Error searching all platforms:', error);
    return [];
  }
};

module.exports = {
  searchAmazonProducts,
  searchFlipkartProducts,
  searchMyntraProducts,
  searchAjioProducts,
  searchNykaaProducts,
  searchMeeshoProducts,
  searchAllPlatforms,
  generateAffiliateUrl
};

