const ScrapingTask = require('../models/ScrapingTask');
const Product = require('../models/Product');
const { scrapeProductData } = require('../helpers/web-scraper');

// Get all scraping tasks
const getAllScrapingTasks = async (req, res) => {
  try {
    const { status, platform, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (platform) query.platform = platform.toLowerCase();
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tasks = await ScrapingTask.find(query)
      .populate('productId', 'name image')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await ScrapingTask.countDocuments(query);
    
    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scraping tasks',
      error: error.message
    });
  }
};

// Get scraping task by ID
const getScrapingTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await ScrapingTask.findById(id).populate('productId');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Scraping task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scraping task',
      error: error.message
    });
  }
};

// Create scraping task
const createScrapingTask = async (req, res) => {
  try {
    const { productId, affiliateUrl, platform, taskType = 'all' } = req.body;
    
    // Validate required fields
    if (!productId || !affiliateUrl || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, affiliate URL, and platform are required'
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
    
    // Get current price data for comparison
    const currentPrice = product.prices.find(p => p.website === platform.toLowerCase());
    const previousData = currentPrice ? {
      price: currentPrice.price,
      originalPrice: currentPrice.originalPrice,
      discount: currentPrice.discount,
      rating: currentPrice.rating,
      reviews: currentPrice.reviews,
      inStock: currentPrice.inStock
    } : null;
    
    // Create scraping task
    const task = new ScrapingTask({
      productId,
      affiliateUrl,
      platform: platform.toLowerCase(),
      taskType,
      previousData,
      status: 'pending'
    });
    
    await task.save();
    
    res.status(201).json({
      success: true,
      data: task,
      message: 'Scraping task created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating scraping task',
      error: error.message
    });
  }
};

// Execute scraping task immediately
const executeScrapingTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await ScrapingTask.findById(id).populate('productId');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Scraping task not found'
      });
    }
    
    if (task.status === 'running') {
      return res.status(400).json({
        success: false,
        message: 'Task is already running'
      });
    }
    
    // Update task status
    task.status = 'running';
    task.startedAt = new Date();
    await task.save();
    
    const startTime = Date.now();
    
    try {
      // Scrape product data
      const scrapedData = await scrapeProductData(
        task.affiliateUrl,
        task.platform,
        task.taskType
      );
      
      const executionTime = Date.now() - startTime;
      
      // Update task with results
      task.result = {
        ...scrapedData,
        scrapedAt: new Date()
      };
      task.executionTime = executionTime;
      
      // Compare with previous data
      if (task.previousData) {
        const changes = {
          priceChanged: false,
          priceDifference: 0,
          reviewChanged: false,
          stockChanged: false
        };
        
        if (task.previousData.price && scrapedData.price) {
          changes.priceDifference = scrapedData.price - task.previousData.price;
          changes.priceChanged = Math.abs(changes.priceDifference) > 0.01; // Account for floating point
        }
        
        if (task.previousData.reviews && scrapedData.reviews) {
          changes.reviewChanged = scrapedData.reviews !== task.previousData.reviews;
        }
        
        if (task.previousData.inStock !== undefined && scrapedData.inStock !== undefined) {
          changes.stockChanged = scrapedData.inStock !== task.previousData.inStock;
        }
        
        task.changes = changes;
        
        // Update product if price changed
        if (changes.priceChanged || changes.stockChanged || changes.reviewChanged) {
          const product = await Product.findById(task.productId);
          if (product) {
            const priceIndex = product.prices.findIndex(p => p.website === task.platform);
            
            if (priceIndex !== -1) {
              product.prices[priceIndex] = {
                ...product.prices[priceIndex],
                price: scrapedData.price || product.prices[priceIndex].price,
                originalPrice: scrapedData.originalPrice || product.prices[priceIndex].originalPrice,
                discount: scrapedData.discount || product.prices[priceIndex].discount,
                rating: scrapedData.rating || product.prices[priceIndex].rating,
                reviews: scrapedData.reviews || product.prices[priceIndex].reviews,
                inStock: scrapedData.inStock !== undefined ? scrapedData.inStock : product.prices[priceIndex].inStock,
                lastUpdated: new Date()
              };
              
              product.updatedAt = new Date();
              await product.save();
            }
          }
        }
      }
      
      task.status = 'completed';
      task.completedAt = new Date();
      await task.save();
      
      res.json({
        success: true,
        data: task,
        message: 'Scraping task completed successfully'
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      task.status = 'failed';
      task.executionTime = executionTime;
      task.error = {
        message: error.message,
        code: error.code || 'SCRAPING_ERROR',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
      task.completedAt = new Date();
      await task.save();
      
      res.status(500).json({
        success: false,
        message: 'Scraping task failed',
        error: error.message,
        data: task
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error executing scraping task',
      error: error.message
    });
  }
};

// Delete scraping task
const deleteScrapingTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await ScrapingTask.findByIdAndDelete(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Scraping task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Scraping task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting scraping task',
      error: error.message
    });
  }
};

// Bulk create scraping tasks for all products
const bulkCreateScrapingTasks = async (req, res) => {
  try {
    const { platform, taskType = 'all' } = req.body;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required'
      });
    }
    
    // Get all products with affiliate links for the specified platform
    const products = await Product.find({
      'prices.website': platform.toLowerCase(),
      'prices.url': { $exists: true, $ne: '' }
    });
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found with affiliate links for ${platform}`
      });
    }
    
    const tasks = [];
    
    for (const product of products) {
      const price = product.prices.find(p => p.website === platform.toLowerCase());
      
      if (price && price.url) {
        const previousData = {
          price: price.price,
          originalPrice: price.originalPrice,
          discount: price.discount,
          rating: price.rating,
          reviews: price.reviews,
          inStock: price.inStock
        };
        
        tasks.push({
          productId: product._id,
          affiliateUrl: price.url,
          platform: platform.toLowerCase(),
          taskType,
          previousData,
          status: 'pending'
        });
      }
    }
    
    const createdTasks = await ScrapingTask.insertMany(tasks);
    
    res.status(201).json({
      success: true,
      data: createdTasks,
      count: createdTasks.length,
      message: `Created ${createdTasks.length} scraping tasks for ${platform}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bulk scraping tasks',
      error: error.message
    });
  }
};

// Bulk execute scraping for all products (one-click scrape all)
const bulkExecuteScraping = async (req, res) => {
  try {
    const { platform, taskType = 'all' } = req.body;
    
    // Get all products with affiliate links
    let query = {
      'prices.url': { $exists: true, $ne: '' }
    };
    
    if (platform) {
      query['prices.website'] = platform.toLowerCase();
    }
    
    const products = await Product.find(query).populate('similarProductIds');
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found with affiliate links'
      });
    }
    
    const results = [];
    const { scrapeProductData } = require('../helpers/web-scraper');
    
    // Process each product
    for (const product of products) {
      for (const priceEntry of product.prices) {
        if (!priceEntry.url || priceEntry.url === '') continue;
        
        const platformToScrape = platform ? platform.toLowerCase() : priceEntry.website;
        
        // Skip if platform filter is set and doesn't match
        if (platform && priceEntry.website !== platformToScrape) continue;
        
        const previousData = {
          price: priceEntry.price,
          originalPrice: priceEntry.originalPrice,
          discount: priceEntry.discount,
          rating: priceEntry.rating,
          reviews: priceEntry.reviews,
          inStock: priceEntry.inStock
        };
        
        const result = {
          productId: product._id,
          productName: product.name,
          platform: priceEntry.website,
          affiliateUrl: priceEntry.url,
          previous: previousData,
          current: null,
          changed: false,
          changes: {},
          error: null,
          updated: false
        };
        
        try {
          // Scrape product data
          const scrapedData = await scrapeProductData(
            priceEntry.url,
            priceEntry.website,
            taskType
          );
          
          result.current = {
            price: scrapedData.price,
            originalPrice: scrapedData.originalPrice,
            discount: scrapedData.discount,
            rating: scrapedData.rating,
            reviews: scrapedData.reviews,
            inStock: scrapedData.inStock
          };
          
          // Compare with previous data
          const changes = {
            priceChanged: false,
            priceDifference: 0,
            reviewChanged: false,
            stockChanged: false,
            ratingChanged: false
          };
          
          if (previousData.price && scrapedData.price) {
            changes.priceDifference = scrapedData.price - previousData.price;
            changes.priceChanged = Math.abs(changes.priceDifference) > 0.01;
          }
          
          if (previousData.reviews && scrapedData.reviews) {
            changes.reviewChanged = scrapedData.reviews !== previousData.reviews;
          }
          
          if (previousData.rating && scrapedData.rating) {
            changes.ratingChanged = Math.abs(scrapedData.rating - previousData.rating) > 0.01;
          }
          
          if (previousData.inStock !== undefined && scrapedData.inStock !== undefined) {
            changes.stockChanged = scrapedData.inStock !== previousData.inStock;
          }
          
          result.changes = changes;
          result.changed = changes.priceChanged || changes.reviewChanged || changes.stockChanged || changes.ratingChanged;
          
          // Update product if data changed
          if (result.changed || !previousData.price) {
            const priceIndex = product.prices.findIndex(p => p.website === priceEntry.website);
            
            if (priceIndex !== -1) {
              product.prices[priceIndex] = {
                ...product.prices[priceIndex],
                price: scrapedData.price !== null && scrapedData.price !== undefined ? scrapedData.price : product.prices[priceIndex].price,
                originalPrice: scrapedData.originalPrice !== null && scrapedData.originalPrice !== undefined ? scrapedData.originalPrice : product.prices[priceIndex].originalPrice,
                discount: scrapedData.discount !== null && scrapedData.discount !== undefined ? scrapedData.discount : product.prices[priceIndex].discount,
                rating: scrapedData.rating !== null && scrapedData.rating !== undefined ? scrapedData.rating : product.prices[priceIndex].rating,
                reviews: scrapedData.reviews !== null && scrapedData.reviews !== undefined ? scrapedData.reviews : product.prices[priceIndex].reviews,
                inStock: scrapedData.inStock !== null && scrapedData.inStock !== undefined ? scrapedData.inStock : product.prices[priceIndex].inStock,
                lastUpdated: new Date()
              };
              
              product.updatedAt = new Date();
              await product.save();
              result.updated = true;
            }
          }
        } catch (error) {
          result.error = {
            message: error.message,
            code: error.code || 'SCRAPING_ERROR'
          };
        }
        
        results.push(result);
        
        // Add small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const summary = {
      total: results.length,
      updated: results.filter(r => r.updated).length,
      changed: results.filter(r => r.changed).length,
      unchanged: results.filter(r => !r.changed && !r.error).length,
      errors: results.filter(r => r.error).length
    };
    
    res.json({
      success: true,
      data: results,
      summary,
      message: `Scraping completed: ${summary.updated} products updated, ${summary.errors} errors`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error executing bulk scraping',
      error: error.message
    });
  }
};

module.exports = {
  getAllScrapingTasks,
  getScrapingTaskById,
  createScrapingTask,
  executeScrapingTask,
  deleteScrapingTask,
  bulkCreateScrapingTasks,
  bulkExecuteScraping
};

