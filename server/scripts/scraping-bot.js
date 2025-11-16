// Automated scraping bot that periodically checks and updates product prices
const ScrapingTask = require('../models/ScrapingTask');
const Product = require('../models/Product');
const { scrapeProductData } = require('../helpers/web-scraper');

// Process a single scraping task
const processScrapingTask = async (task) => {
  try {
    // Update task status
    task.status = 'running';
    task.startedAt = new Date();
    await task.save();
    
    const startTime = Date.now();
    
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
        changes.priceChanged = Math.abs(changes.priceDifference) > 0.01;
      }
      
      if (task.previousData.reviews && scrapedData.reviews) {
        changes.reviewChanged = scrapedData.reviews !== task.previousData.reviews;
      }
      
      if (task.previousData.inStock !== undefined && scrapedData.inStock !== undefined) {
        changes.stockChanged = scrapedData.inStock !== task.previousData.inStock;
      }
      
      task.changes = changes;
      
      // Update product if data changed
      if (changes.priceChanged || changes.stockChanged || changes.reviewChanged || !task.previousData.price) {
        const product = await Product.findById(task.productId);
        if (product) {
          const priceIndex = product.prices.findIndex(p => p.website === task.platform);
          
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
            
            console.log(`✅ Updated product ${product.name} (${task.platform}): Price changed: ${changes.priceChanged}, Stock changed: ${changes.stockChanged}`);
          }
        }
      }
    }
    
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();
    
    return {
      success: true,
      task,
      message: 'Scraping task completed successfully'
    };
  } catch (error) {
    const executionTime = Date.now() - Date.parse(task.startedAt);
    task.status = 'failed';
    task.executionTime = executionTime;
    task.error = {
      message: error.message,
      code: error.code || 'SCRAPING_ERROR',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    task.completedAt = new Date();
    task.retryCount = (task.retryCount || 0) + 1;
    await task.save();
    
    console.error(`❌ Scraping task failed for product ${task.productId}: ${error.message}`);
    
    return {
      success: false,
      task,
      error: error.message
    };
  }
};

// Process pending scraping tasks
const processPendingTasks = async (limit = 10) => {
  try {
    // Get pending tasks, ordered by scheduled time
    const tasks = await ScrapingTask.find({
      status: 'pending'
    })
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .populate('productId');
    
    if (tasks.length === 0) {
      return {
        success: true,
        processed: 0,
        message: 'No pending tasks found'
      };
    }
    
    console.log(`🔄 Processing ${tasks.length} pending scraping tasks...`);
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Process tasks sequentially to avoid overwhelming the server
    for (const task of tasks) {
      const result = await processScrapingTask(task);
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({
          taskId: task._id,
          error: result.error
        });
      }
      
      // Add delay between tasks to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }
    
    console.log(`✅ Completed processing: ${results.success} successful, ${results.failed} failed`);
    
    return {
      success: true,
      processed: tasks.length,
      results
    };
  } catch (error) {
    console.error('❌ Error processing pending tasks:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Retry failed tasks
const retryFailedTasks = async (maxRetries = 3, limit = 10) => {
  try {
    const tasks = await ScrapingTask.find({
      status: 'failed',
      retryCount: { $lt: maxRetries }
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('productId');
    
    if (tasks.length === 0) {
      return {
        success: true,
        retried: 0,
        message: 'No failed tasks to retry'
      };
    }
    
    console.log(`🔄 Retrying ${tasks.length} failed scraping tasks...`);
    
    const results = {
      success: 0,
      failed: 0
    };
    
    for (const task of tasks) {
      // Reset task status
      task.status = 'pending';
      task.error = null;
      await task.save();
      
      const result = await processScrapingTask(task);
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
      
      // Add delay between tasks
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`✅ Retry completed: ${results.success} successful, ${results.failed} failed`);
    
    return {
      success: true,
      retried: tasks.length,
      results
    };
  } catch (error) {
    console.error('❌ Error retrying failed tasks:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Start the scraping bot (scheduled task)
const startScrapingBot = (intervalMinutes = 60) => {
  console.log(`🤖 Starting scraping bot (interval: ${intervalMinutes} minutes)`);
  
  // Process immediately on start
  processPendingTasks().catch(err => {
    console.error('❌ Error in initial scraping bot run:', err);
  });
  
  // Schedule periodic processing
  setInterval(async () => {
    try {
      console.log('⏰ Running scheduled scraping bot...');
      await processPendingTasks();
      
      // Also retry failed tasks
      await retryFailedTasks();
    } catch (error) {
      console.error('❌ Error in scheduled scraping bot run:', error);
    }
  }, intervalMinutes * 60 * 1000);
  
  console.log('✅ Scraping bot started successfully');
};

// Export functions
module.exports = {
  processScrapingTask,
  processPendingTasks,
  retryFailedTasks,
  startScrapingBot
};















