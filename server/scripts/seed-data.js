const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: "Men's Cotton T-Shirt",
    description: "Comfortable cotton t-shirt perfect for casual wear",
    category: "men",
    subcategory: "t-shirts",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 599,
        originalPrice: 799,
        discount: 25,
        url: "https://amazon.in/mens-tshirt-nike",
        inStock: true,
        rating: 4.2,
        reviews: 1250,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 549,
        originalPrice: 699,
        discount: 21,
        url: "https://flipkart.com/mens-tshirt-nike",
        inStock: true,
        rating: 4.0,
        reviews: 890,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 699,
        originalPrice: 999,
        discount: 30,
        url: "https://myntra.com/mens-tshirt-nike",
        inStock: true,
        rating: 4.5,
        reviews: 2100,
        lastUpdated: new Date()
      }
    ],
    tags: ["cotton", "casual", "comfortable", "nike"]
  },
  {
    name: "Men's Formal Shirt",
    description: "Classic formal shirt for office and special occasions",
    category: "men",
    subcategory: "formal-shirts",
    brand: "Van Heusen",
    image: "https://images.unsplash.com/photo-1594938298605-cd64d6e80bc9?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 1299,
        originalPrice: 1599,
        discount: 19,
        url: "https://amazon.in/mens-formal-shirt-van-heusen",
        inStock: true,
        rating: 4.4,
        reviews: 1234,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 1199,
        originalPrice: 1499,
        discount: 20,
        url: "https://flipkart.com/mens-formal-shirt-van-heusen",
        inStock: true,
        rating: 4.2,
        reviews: 987,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 1399,
        originalPrice: 1799,
        discount: 22,
        url: "https://myntra.com/mens-formal-shirt-van-heusen",
        inStock: true,
        rating: 4.5,
        reviews: 1567,
        lastUpdated: new Date()
      }
    ],
    tags: ["formal", "office", "classic", "van-heusen"]
  },
  {
    name: "Men's Cotton Kurta",
    description: "Traditional Indian kurta for festive occasions",
    category: "men",
    subcategory: "kurtas",
    brand: "Fabindia",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 899,
        originalPrice: 1199,
        discount: 25,
        url: "https://amazon.in/mens-kurta-fabindia",
        inStock: true,
        rating: 4.3,
        reviews: 567,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 799,
        originalPrice: 999,
        discount: 20,
        url: "https://flipkart.com/mens-kurta-fabindia",
        inStock: true,
        rating: 4.1,
        reviews: 423,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 999,
        originalPrice: 1299,
        discount: 23,
        url: "https://myntra.com/mens-kurta-fabindia",
        inStock: true,
        rating: 4.4,
        reviews: 789,
        lastUpdated: new Date()
      }
    ],
    tags: ["traditional", "cotton", "festive", "fabindia"]
  },
  {
    name: "Women's Summer Dress",
    description: "Elegant summer dress perfect for any occasion",
    category: "women",
    subcategory: "dresses",
    brand: "Zara",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 1299,
        originalPrice: 1599,
        discount: 19,
        url: "https://amazon.in/womens-dress-zara",
        inStock: true,
        rating: 4.3,
        reviews: 980,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 1199,
        originalPrice: 1499,
        discount: 20,
        url: "https://flipkart.com/womens-dress-zara",
        inStock: true,
        rating: 4.1,
        reviews: 756,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 1399,
        originalPrice: 1799,
        discount: 22,
        url: "https://myntra.com/womens-dress-zara",
        inStock: true,
        rating: 4.4,
        reviews: 1340,
        lastUpdated: new Date()
      }
    ],
    tags: ["summer", "elegant", "dress", "zara"]
  },
  {
    name: "Women's Designer Top",
    description: "Stylish designer top for casual and semi-formal wear",
    category: "women",
    subcategory: "tops",
    brand: "H&M",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 799,
        originalPrice: 999,
        discount: 20,
        url: "https://amazon.in/womens-top-hm",
        inStock: true,
        rating: 4.2,
        reviews: 654,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 699,
        originalPrice: 899,
        discount: 22,
        url: "https://flipkart.com/womens-top-hm",
        inStock: true,
        rating: 4.0,
        reviews: 432,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 899,
        originalPrice: 1199,
        discount: 25,
        url: "https://myntra.com/womens-top-hm",
        inStock: true,
        rating: 4.3,
        reviews: 876,
        lastUpdated: new Date()
      }
    ],
    tags: ["stylish", "casual", "designer", "hm"]
  },
  {
    name: "Women's Designer Kurta",
    description: "Beautiful traditional kurta with modern design",
    category: "women",
    subcategory: "kurtas",
    brand: "Fabindia",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 1199,
        originalPrice: 1499,
        discount: 20,
        url: "https://amazon.in/womens-kurta-fabindia",
        inStock: true,
        rating: 4.4,
        reviews: 789,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 1099,
        originalPrice: 1399,
        discount: 21,
        url: "https://flipkart.com/womens-kurta-fabindia",
        inStock: true,
        rating: 4.2,
        reviews: 567,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 1299,
        originalPrice: 1699,
        discount: 24,
        url: "https://myntra.com/womens-kurta-fabindia",
        inStock: true,
        rating: 4.5,
        reviews: 1234,
        lastUpdated: new Date()
      }
    ],
    tags: ["traditional", "designer", "festive", "fabindia"]
  },
  {
    name: "Kids' Denim Jeans",
    description: "Durable denim jeans for active kids",
    category: "kids",
    subcategory: "boys-clothing",
    brand: "H&M",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 799,
        originalPrice: 999,
        discount: 20,
        url: "https://amazon.in/kids-jeans-hm",
        inStock: true,
        rating: 4.0,
        reviews: 456,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 749,
        originalPrice: 899,
        discount: 17,
        url: "https://flipkart.com/kids-jeans-hm",
        inStock: true,
        rating: 3.9,
        reviews: 234,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 899,
        originalPrice: 1199,
        discount: 25,
        url: "https://myntra.com/kids-jeans-hm",
        inStock: true,
        rating: 4.2,
        reviews: 678,
        lastUpdated: new Date()
      }
    ],
    tags: ["denim", "kids", "durable", "hm"]
  },
  {
    name: "Kids' Cute Dress",
    description: "Adorable dress for little girls",
    category: "kids",
    subcategory: "girls-clothing",
    brand: "Zara Kids",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 599,
        originalPrice: 799,
        discount: 25,
        url: "https://amazon.in/kids-dress-zara",
        inStock: true,
        rating: 4.3,
        reviews: 234,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 549,
        originalPrice: 699,
        discount: 21,
        url: "https://flipkart.com/kids-dress-zara",
        inStock: true,
        rating: 4.1,
        reviews: 156,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 699,
        originalPrice: 899,
        discount: 22,
        url: "https://myntra.com/kids-dress-zara",
        inStock: true,
        rating: 4.4,
        reviews: 345,
        lastUpdated: new Date()
      }
    ],
    tags: ["cute", "girls", "dress", "zara-kids"]
  },
  {
    name: "Men's Formal Shirt",
    description: "Classic formal shirt for office and special occasions",
    category: "men",
    subcategory: "shirts",
    brand: "Van Heusen",
    image: "https://images.unsplash.com/photo-1594938298605-cd64d6e80bc9?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 1299,
        originalPrice: 1599,
        discount: 19,
        url: "https://amazon.in/mens-formal-shirt-van-heusen",
        inStock: true,
        rating: 4.4,
        reviews: 1234,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 1199,
        originalPrice: 1499,
        discount: 20,
        url: "https://flipkart.com/mens-formal-shirt-van-heusen",
        inStock: true,
        rating: 4.2,
        reviews: 987,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 1399,
        originalPrice: 1799,
        discount: 22,
        url: "https://myntra.com/mens-formal-shirt-van-heusen",
        inStock: true,
        rating: 4.5,
        reviews: 1567,
        lastUpdated: new Date()
      }
    ],
    tags: ["formal", "office", "classic", "van-heusen"]
  },
  {
    name: "Women's Handbag",
    description: "Stylish handbag perfect for daily use",
    category: "women",
    subcategory: "bags",
    brand: "Louis Vuitton",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    prices: [
      {
        website: "amazon",
        price: 8999,
        originalPrice: 10999,
        discount: 18,
        url: "https://amazon.in/womens-handbag-louis-vuitton",
        inStock: true,
        rating: 4.6,
        reviews: 234,
        lastUpdated: new Date()
      },
      {
        website: "flipkart",
        price: 8499,
        originalPrice: 9999,
        discount: 15,
        url: "https://flipkart.com/womens-handbag-louis-vuitton",
        inStock: true,
        rating: 4.4,
        reviews: 189,
        lastUpdated: new Date()
      },
      {
        website: "myntra",
        price: 9499,
        originalPrice: 11999,
        discount: 21,
        url: "https://myntra.com/womens-handbag-louis-vuitton",
        inStock: true,
        rating: 4.7,
        reviews: 345,
        lastUpdated: new Date()
      }
    ],
    tags: ["handbag", "stylish", "luxury", "louis-vuitton"]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Inserted sample products');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
