const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get settings for admin user
const getSettings = async (req, res) => {
  try {
    const adminId = req.user.userId; // From JWT middleware
    
    let settings = await Settings.findOne({ adminId });
    
    // If no settings exist, create default settings
    if (!settings) {
      const adminUser = await User.findById(adminId);
      if (!adminUser) {
        return res.status(404).json({
          success: false,
          message: 'Admin user not found'
        });
      }
      
      settings = new Settings({
        adminId,
        adminName: adminUser.name || '',
        adminEmail: adminUser.email || ''
      });
      await settings.save();
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// Get application settings (global - no auth needed for reading)
const getApplicationSettings = async (req, res) => {
  try {
    // Get first admin's settings or create default
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      return res.json({
        success: true,
        data: {
          siteName: 'Price Compare',
          siteDescription: 'Compare prices across multiple platforms',
          maintenanceMode: false,
          productsPerPage: 20,
          enableFeaturedProducts: true
        }
      });
    }
    
    let settings = await Settings.findOne({ adminId: adminUser._id });
    
    if (!settings) {
      settings = new Settings({
        adminId: adminUser._id
      });
      await settings.save();
    }
    
    res.json({
      success: true,
      data: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        maintenanceMode: settings.maintenanceMode,
        productsPerPage: settings.productsPerPage,
        enableFeaturedProducts: settings.enableFeaturedProducts,
        enableAlerts: settings.enableAlerts !== undefined ? settings.enableAlerts : true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application settings',
      error: error.message
    });
  }
};

// Update account settings
const updateAccountSettings = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { adminName, adminEmail, currentPassword, newPassword } = req.body;
    
    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    // If password change is requested, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }
      
      const isPasswordValid = await adminUser.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Update password
      adminUser.password = newPassword;
      await adminUser.save();
    }
    
    // Update name if provided
    if (adminName) {
      adminUser.name = adminName;
      await adminUser.save();
    }
    
    // Update email if provided
    if (adminEmail && adminEmail !== adminUser.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email: adminEmail, _id: { $ne: adminId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      adminUser.email = adminEmail;
      await adminUser.save();
    }
    
    // Update or create settings
    let settings = await Settings.findOne({ adminId });
    if (!settings) {
      settings = new Settings({
        adminId,
        adminName: adminUser.name,
        adminEmail: adminUser.email
      });
    } else {
      settings.adminName = adminUser.name;
      settings.adminEmail = adminUser.email;
    }
    await settings.save();
    
    res.json({
      success: true,
      message: 'Account settings updated successfully',
      data: {
        user: {
          name: adminUser.name,
          email: adminUser.email
        },
        settings: {
          adminName: settings.adminName,
          adminEmail: settings.adminEmail
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating account settings',
      error: error.message
    });
  }
};

// Update application settings
const updateApplicationSettings = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const {
      siteName,
      siteDescription,
      maintenanceMode,
      productsPerPage,
      enableFeaturedProducts,
      enableAlerts,
      logo
    } = req.body;
    
    let settings = await Settings.findOne({ adminId });
    
    if (!settings) {
      const adminUser = await User.findById(adminId);
      settings = new Settings({
        adminId,
        adminName: adminUser?.name || '',
        adminEmail: adminUser?.email || ''
      });
    }
    
    // Update application settings
    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (productsPerPage !== undefined) settings.productsPerPage = productsPerPage;
    if (enableFeaturedProducts !== undefined) settings.enableFeaturedProducts = enableFeaturedProducts;
    if (enableAlerts !== undefined) settings.enableAlerts = enableAlerts;
    if (logo !== undefined) settings.logo = logo;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Application settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application settings',
      error: error.message
    });
  }
};

// Update logo
const updateLogo = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { logo } = req.body;
    
    if (!logo) {
      return res.status(400).json({
        success: false,
        message: 'Logo URL is required'
      });
    }
    
    let settings = await Settings.findOne({ adminId });
    
    if (!settings) {
      const adminUser = await User.findById(adminId);
      settings = new Settings({
        adminId,
        adminName: adminUser?.name || '',
        adminEmail: adminUser?.email || ''
      });
    }
    
    settings.logo = logo;
    await settings.save();
    
    res.json({
      success: true,
      message: 'Logo updated successfully',
      data: {
        logo: settings.logo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating logo',
      error: error.message
    });
  }
};

// Update notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const {
      emailNotifications,
      productAlerts,
      priceUpdateNotifications
    } = req.body;
    
    let settings = await Settings.findOne({ adminId });
    
    if (!settings) {
      const adminUser = await User.findById(adminId);
      settings = new Settings({
        adminId,
        adminName: adminUser?.name || '',
        adminEmail: adminUser?.email || ''
      });
    }
    
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (productAlerts !== undefined) settings.productAlerts = productAlerts;
    if (priceUpdateNotifications !== undefined) settings.priceUpdateNotifications = priceUpdateNotifications;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: error.message
    });
  }
};

// Update security settings
const updateSecuritySettings = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const {
      requirePasswordReset,
      sessionTimeout
    } = req.body;
    
    let settings = await Settings.findOne({ adminId });
    
    if (!settings) {
      const adminUser = await User.findById(adminId);
      settings = new Settings({
        adminId,
        adminName: adminUser?.name || '',
        adminEmail: adminUser?.email || ''
      });
    }
    
    if (requirePasswordReset !== undefined) settings.requirePasswordReset = requirePasswordReset;
    if (sessionTimeout !== undefined) settings.sessionTimeout = sessionTimeout;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating security settings',
      error: error.message
    });
  }
};

// Get currency settings (public endpoint - no auth needed)
const getCurrencySettings = async (req, res) => {
  try {
    // Get first admin's settings or create default
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      return res.json({
        success: true,
        data: {}
      });
    }
    
    let settings = await Settings.findOne({ adminId: adminUser._id });
    
    if (!settings) {
      settings = new Settings({
        adminId: adminUser._id
      });
      await settings.save();
    }
    
    // Convert Map to plain object for JSON response
    const currencySettings = {};
    if (settings.countryCurrencySettings && settings.countryCurrencySettings.size > 0) {
      settings.countryCurrencySettings.forEach((value, key) => {
        currencySettings[key] = {
          currency: value.currency,
          exchangeRate: value.exchangeRate
        };
      });
    }
    
    res.json({
      success: true,
      data: currencySettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching currency settings',
      error: error.message
    });
  }
};

// Update currency settings
const updateCurrencySettings = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { countryCurrencySettings } = req.body;
    
    if (!countryCurrencySettings || typeof countryCurrencySettings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency settings format'
      });
    }
    
    let settings = await Settings.findOne({ adminId });
    
    if (!settings) {
      const adminUser = await User.findById(adminId);
      settings = new Settings({
        adminId,
        adminName: adminUser?.name || '',
        adminEmail: adminUser?.email || ''
      });
    }
    
    // Clear existing currency settings
    settings.countryCurrencySettings = new Map();
    
    // Set new currency settings
    Object.entries(countryCurrencySettings).forEach(([countryCode, config]) => {
      if (config && config.currency) {
        // If exchangeRate is null or undefined, don't set it (will be auto-fetched on frontend)
        // Otherwise, parse and store the provided rate
        const currencyConfig = {
          currency: config.currency
        };
        
        if (config.exchangeRate !== null && config.exchangeRate !== undefined) {
          const parsedRate = parseFloat(config.exchangeRate);
          if (!isNaN(parsedRate) && parsedRate > 0) {
            currencyConfig.exchangeRate = parsedRate;
          } else {
            // Invalid rate, use default 1 (will be auto-fetched)
            currencyConfig.exchangeRate = 1;
          }
        } else {
          // No rate provided, use 1 as default (will be auto-fetched on frontend)
          currencyConfig.exchangeRate = 1;
        }
        
        settings.countryCurrencySettings.set(countryCode, currencyConfig);
      }
    });
    
    await settings.save();
    
    // Convert Map to plain object for response
    const currencySettings = {};
    settings.countryCurrencySettings.forEach((value, key) => {
      currencySettings[key] = {
        currency: value.currency,
        exchangeRate: value.exchangeRate
      };
    });
    
    res.json({
      success: true,
      message: 'Currency settings updated successfully',
      data: currencySettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating currency settings',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  getApplicationSettings,
  updateAccountSettings,
  updateApplicationSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateLogo,
  getCurrencySettings,
  updateCurrencySettings
};



