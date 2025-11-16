const PriceAlert = require('../models/PriceAlert');
const Product = require('../models/Product');
const { sendPriceAlertEmail } = require('./email-service');

// Reusable function to check price alerts
const checkPriceAlerts = async (productId = null) => {
  try {
    console.log('Checking price alerts...', productId ? `for product: ${productId}` : 'for all products');
    
    // Build query - if productId is provided, only check alerts for that product
    const query = {
      active: true,
      notified: false
    };
    
    if (productId) {
      query.productId = productId;
    }
    
    // Get all active, non-notified alerts
    const alerts = await PriceAlert.find(query).populate('productId');

    console.log(`Found ${alerts.length} active price alerts to check`);

    let notifiedCount = 0;
    let errorCount = 0;

    for (const alert of alerts) {
      try {
        if (!alert.productId) {
          console.log(`Skipping alert ${alert._id} - product not found`);
          continue;
        }

        const product = alert.productId;
        
        // Find the relevant price
        let relevantPrice = null;
        
        if (alert.website) {
          // If website is specified, check that website's price
          relevantPrice = product.prices.find(p => p.website === alert.website);
        } else {
          // If no website specified, check the lowest price
          if (product.prices && product.prices.length > 0) {
            relevantPrice = product.prices.reduce((lowest, current) => {
              return (current.price < lowest.price) ? current : lowest;
            });
          }
        }

        if (!relevantPrice) {
          console.log(`⚠️ No price found for alert ${alert._id} (product: ${product.name}, website: ${alert.website || 'lowest'})`);
          continue;
        }

        // Ensure price is a valid number
        if (isNaN(relevantPrice.price) || relevantPrice.price === null || relevantPrice.price === undefined) {
          console.log(`⚠️ Invalid price for alert ${alert._id} (product: ${product.name}, price: ${relevantPrice.price})`);
          continue;
        }

        const currentPrice = parseFloat(relevantPrice.price);
        const minPrice = parseFloat(alert.minPrice);
        const maxPrice = parseFloat(alert.maxPrice);

        console.log(`Checking alert for product: ${product.name}, Current Price: ₹${currentPrice}, Alert Range: ₹${minPrice}-₹${maxPrice}`);

        // Check if current price falls within the alert range
        if (currentPrice >= minPrice && currentPrice <= maxPrice) {
          console.log(`✅ Price alert triggered! Product: ${product.name}, Range: ₹${minPrice}-₹${maxPrice}, Current: ₹${currentPrice}`);
          
          // Send email notification
          const emailResult = await sendPriceAlertEmail(
            alert.email,
            product,
            minPrice,
            maxPrice,
            currentPrice,
            alert.website || relevantPrice.website
          );

          if (emailResult.success) {
            // Mark alert as notified
            alert.notified = true;
            alert.notifiedAt = new Date();
            alert.updatedAt = new Date();
            await alert.save();
            
            console.log(`Alert notification sent to ${alert.email}`);
            notifiedCount++;
          } else {
            console.error(`Failed to send alert to ${alert.email}:`, emailResult.error || emailResult.message);
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing alert ${alert._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Price alert check completed. Notified: ${notifiedCount}, Errors: ${errorCount}`);
    
    return {
      success: true,
      checked: alerts.length,
      notified: notifiedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('Error checking price alerts:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { checkPriceAlerts };


