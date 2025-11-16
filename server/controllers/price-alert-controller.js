const PriceAlert = require('../models/PriceAlert');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const User = require('../models/User');

// Create a new price alert
const createPriceAlert = async (req, res) => {
  try {
    const { email, productId, minPrice, maxPrice, website } = req.body;

    // Check if alerts are enabled
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      const settings = await Settings.findOne({ adminId: adminUser._id });
      if (settings && settings.enableAlerts === false) {
        return res.status(403).json({
          success: false,
          message: 'Price alerts are currently disabled. Please contact the administrator.'
        });
      }
    }

    // Validation
    if (!email || !productId || minPrice === undefined || maxPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Email, product ID, min price, and max price are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate price range
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    
    if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
      return res.status(400).json({
        success: false,
        message: 'Min and max prices must be valid positive numbers'
      });
    }

    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'Min price cannot be greater than max price'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if alert already exists for this email and product
    const existingAlert = await PriceAlert.findOne({
      email: email.toLowerCase(),
      productId,
      active: true
    });

    if (existingAlert) {
      // Update existing alert
      existingAlert.minPrice = min;
      existingAlert.maxPrice = max;
      existingAlert.website = website || null;
      existingAlert.notified = false;
      existingAlert.notifiedAt = null;
      existingAlert.updatedAt = new Date();
      await existingAlert.save();

      return res.json({
        success: true,
        data: existingAlert,
        message: 'Price alert updated successfully'
      });
    }

    // Create new alert
    const alert = new PriceAlert({
      email: email.toLowerCase(),
      productId,
      minPrice: min,
      maxPrice: max,
      website: website || null,
      active: true,
      notified: false
    });

    await alert.save();

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Price alert created successfully'
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating price alert',
      error: error.message
    });
  }
};

// Get all alerts for an email
const getUserAlerts = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const alerts = await PriceAlert.find({
      email: email.toLowerCase(),
      active: true
    })
      .populate('productId', 'name brand category subcategory image images prices')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

// Delete (deactivate) a price alert
const deletePriceAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await PriceAlert.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found'
      });
    }

    // Deactivate instead of deleting
    alert.active = false;
    alert.updatedAt = new Date();
    await alert.save();

    res.json({
      success: true,
      message: 'Price alert deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting price alert',
      error: error.message
    });
  }
};

// Get active alerts for a product (for checking price drops)
const getProductAlerts = async (req, res) => {
  try {
    const { productId } = req.params;

    const alerts = await PriceAlert.find({
      productId,
      active: true,
      notified: false
    });

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching product alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product alerts',
      error: error.message
    });
  }
};

// Manually trigger price alert check
const triggerPriceCheck = async (req, res) => {
  try {
    const { productId } = req.body;
    
    const { checkPriceAlerts } = require('../helpers/check-price-alerts');
    const result = await checkPriceAlerts(productId || null);
    
    res.json({
      success: result.success,
      message: result.success 
        ? `Checked ${result.checked} alerts. Notified: ${result.notified}, Errors: ${result.errors}`
        : 'Error checking alerts',
      data: result
    });
  } catch (error) {
    console.error('Error triggering price check:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering price check',
      error: error.message
    });
  }
};

module.exports = {
  createPriceAlert,
  getUserAlerts,
  deletePriceAlert,
  getProductAlerts,
  triggerPriceCheck
};

