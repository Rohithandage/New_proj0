const mongoose = require('mongoose');

const scrapingTaskSchema = new mongoose.Schema({
  taskType: {
    type: String,
    required: true,
    enum: ['price', 'review', 'availability', 'all'],
    default: 'price'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  affiliateUrl: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho'],
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  result: {
    price: Number,
    originalPrice: Number,
    discount: Number,
    rating: Number,
    reviews: Number,
    inStock: Boolean,
    availability: String,
    scrapedAt: Date
  },
  previousData: {
    price: Number,
    originalPrice: Number,
    discount: Number,
    rating: Number,
    reviews: Number,
    inStock: Boolean
  },
  changes: {
    priceChanged: Boolean,
    priceDifference: Number,
    reviewChanged: Boolean,
    stockChanged: Boolean
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
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

// Indexes for better query performance
scrapingTaskSchema.index({ productId: 1, status: 1 });
scrapingTaskSchema.index({ platform: 1, status: 1 });
scrapingTaskSchema.index({ scheduledAt: 1 });
scrapingTaskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ScrapingTask', scrapingTaskSchema);
