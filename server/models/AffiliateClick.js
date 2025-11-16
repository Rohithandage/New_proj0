const mongoose = require('mongoose');

const affiliateClickSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true,
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho']
  },
  affiliateUrl: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'Unknown'
  },
  countryCode: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  clickedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
affiliateClickSchema.index({ productId: 1 });
affiliateClickSchema.index({ website: 1 });
affiliateClickSchema.index({ country: 1 });
affiliateClickSchema.index({ clickedAt: -1 });
affiliateClickSchema.index({ productId: 1, country: 1 });
affiliateClickSchema.index({ website: 1, country: 1 });

module.exports = mongoose.model('AffiliateClick', affiliateClickSchema);





