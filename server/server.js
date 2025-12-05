const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const priceComparisonRouter = require("./routes/price-comparison-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const imageUploadRouter = require("./routes/common/image-upload-routes");
const adminAuthRouter = require("./routes/auth/admin-auth-routes");
const userAuthRouter = require("./routes/auth/user-auth-routes");
const settingsRouter = require("./routes/settings-routes");
const priceAlertRouter = require("./routes/price-alert-routes");
const apiManagementRouter = require("./routes/api-management-routes");
const webScrapingRouter = require("./routes/web-scraping-routes");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB connection with proper options
mongoose.set('bufferCommands', true); // Buffer commands until connection is ready
mongoose.set('strictQuery', false);

// Middleware setup (always available)
app.use(
  cors({
    //origin: "http://localhost:5173",
    origin:[
      "http://localhost:5173",
      "https://new-proj0-1.onrender.com",
      "https://new-proj0.onrender.com"
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Routes setup (always available)
app.use("/api/price-comparison", priceComparisonRouter);
app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/upload", imageUploadRouter);
app.use("/api/auth/admin", adminAuthRouter);
app.use("/api/auth/user", userAuthRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/price-alerts", priceAlertRouter);
app.use("/api/admin/api-configs", apiManagementRouter);
app.use("/api/admin/scraping-tasks", webScrapingRouter);

// Server start flag to prevent multiple starts
let serverStarted = false;

// Connect to MongoDB before starting the server
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
    });
    console.log("✅ MongoDB connected successfully");
    
    // Start server only once and only after MongoDB is connected
    if (!serverStarted) {
      app.listen(PORT, () => {
        console.log(`🚀 Server is now running on port ${PORT}`);
      });
      serverStarted = true;
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Only retry if server hasn't started (to avoid retry loop after server is running)
    if (!serverStarted) {
      setTimeout(connectDB, 5000);
    }
  }
};

// Initialize database connection
connectDB();

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Schedule periodic price alert checks
const schedulePriceAlertChecks = () => {
  // Check price alerts every hour
  setInterval(async () => {
    try {
      console.log('⏰ Running scheduled price alert check...');
      const { checkPriceAlerts } = require('./helpers/check-price-alerts');
      const result = await checkPriceAlerts();
      if (result.success) {
        console.log(`✅ Price alert check completed: ${result.notified} notifications sent, ${result.errors} errors`);
      } else {
        console.error('❌ Price alert check failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error in scheduled price alert check:', error.message);
    }
  }, 60 * 60 * 1000); // Check every hour (60 minutes * 60 seconds * 1000 milliseconds)

  // Also run an initial check after 5 minutes of server start
  setTimeout(async () => {
    try {
      console.log('⏰ Running initial price alert check...');
      const { checkPriceAlerts } = require('./helpers/check-price-alerts');
      const result = await checkPriceAlerts();
      if (result.success) {
        console.log(`✅ Initial price alert check completed: ${result.notified} notifications sent, ${result.errors} errors`);
      }
    } catch (error) {
      console.error('❌ Error in initial price alert check:', error.message);
    }
  }, 5 * 60 * 1000); // Run after 5 minutes
};

// Start scheduled price alert checks after MongoDB connection is established
mongoose.connection.once('open', () => {
  console.log('📧 Starting price alert scheduler...');
  
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('');
    console.warn('⚠️  WARNING: Email service is not configured!');
    console.warn('   Price alerts will be checked but emails will NOT be sent.');
    console.warn('   To enable email notifications, add these to your .env file:');
    console.warn('   EMAIL_USER=your-email@gmail.com');
    console.warn('   EMAIL_PASSWORD=your-app-password');
    console.warn('   EMAIL_HOST=smtp.gmail.com (optional, default)');
    console.warn('   EMAIL_PORT=587 (optional, default)');
    console.warn('   FRONTEND_URL=http://localhost:5173 (optional, for email links)');
    console.warn('');
    console.warn('   For Gmail, you need to create an App Password:');
    console.warn('   https://support.google.com/accounts/answer/185833');
    console.warn('');
  } else {
    // Test email connection
    const { testEmailConnection } = require('./helpers/email-service');
    testEmailConnection().then(result => {
      if (result.success) {
        console.log('✅ Email service is configured and ready');
      } else {
        console.warn('⚠️  Email service configured but connection test failed:', result.error);
      }
    });
  }
  
  schedulePriceAlertChecks();
  
  // Start scraping bot (check every hour by default, or use SCRAPING_INTERVAL env var)
  const scrapingInterval = parseInt(process.env.SCRAPING_INTERVAL_MINUTES) || 60;
  const { startScrapingBot } = require('./scripts/scraping-bot');
  startScrapingBot(scrapingInterval);
});
