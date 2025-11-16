const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/price-comparison-controller');

// Search products
router.get('/search', searchProducts);

// Get product details
router.get('/product/:productId', getProductDetails);

// Fetch real-time prices
router.get('/product/:productId/prices', fetchRealTimePrices);

// Get categories
router.get('/categories', getCategories);

// Add new product (admin)
router.post('/product', addProduct);

// Update product (admin)
router.put('/product/:productId', updateProduct);

// Delete product (admin)
router.delete('/product/:productId', deleteProduct);

// Get similar products
router.get('/similar-products', getSimilarProducts);

// Track affiliate click
router.post('/track-affiliate-click', trackAffiliateClick);

// Get affiliate statistics (admin)
router.get('/affiliate-stats', getAffiliateStats);

module.exports = router;

