const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Admin Account Settings (stored per admin user)
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  adminName: {
    type: String,
    default: ''
  },
  adminEmail: {
    type: String,
    default: ''
  },
  
  // Application Settings (global settings - only one document)
  siteName: {
    type: String,
    default: 'Price Compare'
  },
  siteDescription: {
    type: String,
    default: 'Compare prices across multiple platforms'
  },
  logo: {
    type: String,
    default: '/Logo.png' // Default logo path
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  productsPerPage: {
    type: Number,
    default: 20,
    min: 10,
    max: 100
  },
  enableFeaturedProducts: {
    type: Boolean,
    default: true
  },
  enableAlerts: {
    type: Boolean,
    default: true
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  productAlerts: {
    type: Boolean,
    default: true
  },
  priceUpdateNotifications: {
    type: Boolean,
    default: true
  },
  
  // Security Settings
  requirePasswordReset: {
    type: Boolean,
    default: false
  },
  sessionTimeout: {
    type: Number,
    default: 30, // minutes
    min: 5,
    max: 120
  },
  
  // Currency Settings
  // Maps country codes to currency settings
  // Example: { "US": { currency: "USD", exchangeRate: 0.012 }, "GB": { currency: "GBP", exchangeRate: 0.0095 } }
  countryCurrencySettings: {
    type: Map,
    of: {
      currency: {
        type: String,
        required: true
      },
      exchangeRate: {
        type: Number,
        default: 1
      }
    },
    default: {}
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for quick lookups
settingsSchema.index({ adminId: 1 });

module.exports = mongoose.model('Settings', settingsSchema);



