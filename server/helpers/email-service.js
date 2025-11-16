const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Use environment variables for email configuration
  // For Gmail, you'll need to create an App Password
  // See: https://support.google.com/accounts/answer/185833
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // App password for Gmail
    },
  });
};

// Send price drop notification email
const sendPriceAlertEmail = async (email, product, minPrice, maxPrice, currentPrice, website) => {
  try {
    const transporter = createTransporter();

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email credentials not configured. Skipping email notification.');
      console.warn('   Please add EMAIL_USER and EMAIL_PASSWORD to your .env file');
      return { success: false, message: 'Email service not configured' };
    }

    // Get frontend URL from env or use default
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Get product image (use main image or first image from images array)
    const productImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);
    
    // Product page URL in the app
    const productPageUrl = `${frontendUrl}/product/${product._id}`;

    const mailOptions = {
      from: `"Price Alert" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Price Alert: ${product.name} is in your range!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💰 Price Drop Alert!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
            <h2 style="color: #333; margin-top: 0;">Great news! The price is in your range!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${productImage ? `
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="${productImage}" alt="${product.name}" style="max-width: 100%; height: auto; border-radius: 8px; max-height: 400px; object-fit: contain; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                </div>
              ` : ''}
              
              <h3 style="color: #667eea; margin-top: 0; font-size: 22px;">${product.name}</h3>
              <p style="color: #666; margin: 10px 0;"><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
              <p style="color: #666; margin: 10px 0;"><strong>Category:</strong> ${product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'N/A'} - ${product.subcategory ? product.subcategory.charAt(0).toUpperCase() + product.subcategory.slice(1) : 'N/A'}</p>
              
              <div style="margin: 20px 0; padding: 15px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50;">
                <p style="margin: 5px 0; color: #333;"><strong>Your Alert Range:</strong> ₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}</p>
                <p style="margin: 5px 0; color: #4caf50; font-size: 24px; font-weight: bold;">
                  Current Price: ₹${currentPrice.toLocaleString()}
                </p>
                <p style="margin: 5px 0; color: #666;">
                  <strong>Available on:</strong> ${website ? website.charAt(0).toUpperCase() + website.slice(1) : 'Multiple platforms'}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${productPageUrl}" 
                 style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                View Product in App →
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; color: #666; font-size: 12px;">
              <p>You're receiving this email because you set up a price alert for this product.</p>
              <p>To manage your alerts, visit our website.</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Price alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending price alert email:', error);
    return { success: false, error: error.message };
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return { success: false, message: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email service is ready');
    return { success: true };
  } catch (error) {
    console.error('Email connection test failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPriceAlertEmail,
  testEmailConnection
};

