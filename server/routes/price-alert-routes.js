const express = require('express');
const router = express.Router();
const {
  createPriceAlert,
  getUserAlerts,
  deletePriceAlert,
  getProductAlerts,
  triggerPriceCheck
} = require('../controllers/price-alert-controller');

// Create a new price alert
router.post('/', createPriceAlert);

// Get all alerts for a user (by email)
router.get('/user', getUserAlerts);

// Delete (deactivate) a price alert
router.delete('/:alertId', deletePriceAlert);

// Get active alerts for a product (for internal use)
router.get('/product/:productId', getProductAlerts);

// Manually trigger price alert check (for testing/admin use)
router.post('/check', triggerPriceCheck);

module.exports = router;

