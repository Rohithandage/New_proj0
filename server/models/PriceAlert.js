const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  minPrice: {
    type: Number,
    required: true
  },
  maxPrice: {
    type: Number,
    required: true
  },
  website: {
    type: String,
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho'],
    required: false // Optional - if not specified, alerts for lowest price across all websites
  },
  active: {
    type: Boolean,
    default: true
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date,
    default: null
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

// Index for efficient queries
priceAlertSchema.index({ productId: 1, active: 1 });
priceAlertSchema.index({ email: 1, active: 1 });
priceAlertSchema.index({ active: 1, notified: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);

