const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['men', 'women', 'kids']
  },
  subcategory: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  similarProductIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  image: {
    type: String,
    required: false
  },
  images: [{
    type: String,
    required: false
  }],
  prices: [{
    website: {
      type: String,
      required: true,
      enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho']
    },
    price: {
      type: Number,
      required: true
    },
    originalPrice: Number,
    discount: Number,
    url: {
      type: String,
      required: true
    },
    inStock: {
      type: Boolean,
      default: true
    },
    rating: Number,
    reviews: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  trending: {
    type: Boolean,
    default: false
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

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ 'prices.website': 1 });
productSchema.index({ trending: 1 });

module.exports = mongoose.model('Product', productSchema);

