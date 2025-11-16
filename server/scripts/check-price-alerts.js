require('dotenv').config();
const mongoose = require('mongoose');
const { checkPriceAlerts } = require('../helpers/check-price-alerts');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for price alert checking');
    const result = await checkPriceAlerts();
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    if (result.success) {
      console.log(`Successfully checked ${result.checked} alerts. Notified: ${result.notified}, Errors: ${result.errors}`);
      process.exit(0);
    } else {
      console.error('Error checking alerts:', result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

