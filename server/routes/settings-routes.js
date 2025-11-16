const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth-middleware');
const {
  getSettings,
  getApplicationSettings,
  updateAccountSettings,
  updateApplicationSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateLogo,
  getCurrencySettings,
  updateCurrencySettings
} = require('../controllers/settings-controller');

// Get settings (requires auth)
router.get('/', authenticate, getSettings);

// Get application settings (public - for frontend)
router.get('/application', getApplicationSettings);

// Update account settings (requires auth)
router.put('/account', authenticate, updateAccountSettings);

// Update application settings (requires auth)
router.put('/application', authenticate, updateApplicationSettings);

// Update notification settings (requires auth)
router.put('/notifications', authenticate, updateNotificationSettings);

// Update security settings (requires auth)
router.put('/security', authenticate, updateSecuritySettings);

// Logo routes
router.put('/logo', authenticate, updateLogo);

// Currency settings routes
router.get('/currency', getCurrencySettings); // Public endpoint for frontend
router.put('/currency', authenticate, updateCurrencySettings); // Admin only

module.exports = router;



