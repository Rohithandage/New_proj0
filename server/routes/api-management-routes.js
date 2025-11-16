const express = require('express');
const router = express.Router();
const {
  getAllApiConfigs,
  getApiConfigById,
  getApiConfigByPlatform,
  createApiConfig,
  updateApiConfig,
  deleteApiConfig,
  testApiConfig
} = require('../controllers/api-management-controller');
const { authenticate } = require('../middleware/auth-middleware');

// All routes require admin authentication
router.use(authenticate);

// Get all API configurations
router.get('/', getAllApiConfigs);

// Get API configuration by ID
router.get('/:id', getApiConfigById);

// Get API configuration by platform
router.get('/platform/:platform', getApiConfigByPlatform);

// Create new API configuration
router.post('/', createApiConfig);

// Update API configuration
router.put('/:id', updateApiConfig);

// Delete API configuration
router.delete('/:id', deleteApiConfig);

// Test API configuration
router.post('/:id/test', testApiConfig);

module.exports = router;

