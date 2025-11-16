/**
 * MongoDB Cluster Setup Script
 * This script helps you set up your MongoDB cluster connection and create admin users
 * 
 * Prerequisites:
 * 1. MongoDB Atlas account (https://cloud.mongodb.com/)
 * 2. Cluster created in MongoDB Atlas
 * 3. Connection string from MongoDB Atlas
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n📝 Make sure:');
    console.log('   1. Your MongoDB Atlas cluster is running');
    console.log('   2. Your IP address is whitelisted in MongoDB Atlas');
    console.log('   3. Your MONGO_URI in .env file is correct');
    return false;
  }
};

// Create admin user
const createAdminUser = async (name, email, password) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${email} already exists`);
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      return existingAdmin;
    }

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password, // Will be hashed automatically by pre-save hook
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
};

// Create multiple admin users
const createMultipleAdmins = async (admins) => {
  const results = [];
  
  for (const admin of admins) {
    try {
      const user = await createAdminUser(admin.name, admin.email, admin.password);
      results.push({ success: true, user });
    } catch (error) {
      results.push({ success: false, email: admin.email, error: error.message });
    }
  }
  
  return results;
};

// Main setup function
const setupMongoDB = async () => {
  console.log('\n🚀 MongoDB Cluster Setup\n');
  console.log('Connecting to MongoDB...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  console.log('\n📋 Creating admin users...\n');

  // Default admin user(s)
  const defaultAdmins = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123'
    },
    // Add more admin users here if needed
    // {
    //   name: 'Second Admin',
    //   email: 'admin2@example.com',
    //   password: 'admin123'
    // }
  ];

  const results = await createMultipleAdmins(defaultAdmins);

  console.log('\n📊 Setup Summary:');
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`   ✅ Admin ${index + 1}: ${result.user.email}`);
    } else {
      console.log(`   ❌ Admin ${index + 1}: ${result.email} - ${result.error}`);
    }
  });

  console.log('\n✅ Setup completed!\n');
  console.log('🔐 Default Admin Credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
  console.log('\n⚠️  IMPORTANT: Change the default password after first login!\n');

  await mongoose.connection.close();
  process.exit(0);
};

// Run setup if called directly
if (require.main === module) {
  setupMongoDB().catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = {
  connectDB,
  createAdminUser,
  createMultipleAdmins,
  setupMongoDB
};







