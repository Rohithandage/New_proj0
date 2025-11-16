const mongoose = require('mongoose');

const apiConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'other'],
    lowercase: true
  },
  apiKey: {
    type: String,
    required: false,
    trim: true
  },
  secretKey: {
    type: String,
    required: false,
    trim: true
  },
  accessToken: {
    type: String,
    required: false,
    trim: true
  },
  associateTag: {
    type: String,
    required: false,
    trim: true
  },
  endpoint: {
    type: String,
    required: false,
    trim: true
  },
  additionalConfig: {
    type: Map,
    of: String,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTested: {
    type: Date,
    default: null
  },
  testStatus: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  testMessage: {
    type: String,
    default: ''
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

// Index for better query performance
apiConfigSchema.index({ platform: 1, isActive: 1 });
apiConfigSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ApiConfig', apiConfigSchema);
















