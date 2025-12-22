/**
 * Database Setup Script
 * This script will create the database and initialize collections
 * Run: node setup-database.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const MenuItem = require('./src/models/MenuItem');
const Order = require('./src/models/Order');
const Cart = require('./src/models/Cart');
const Feedback = require('./src/models/Feedback');
const ChatLog = require('./src/models/ChatLog');
const SupportChat = require('./src/models/SupportChat');
const Notification = require('./src/models/Notification');
const bcrypt = require('bcryptjs');

const connectAndSetup = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set in .env file');
      console.warn('⚠️  Using default: mongodb://localhost:27017/restaurant-management');
      console.warn('⚠️  Please update your .env file with MongoDB Atlas connection string');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create collections by creating sample documents (they'll be deleted)
    console.log('\n📦 Creating collections...');
    
    // Create collections by initializing models
    await User.createCollection();
    await MenuItem.createCollection();
    await Order.createCollection();
    await Cart.createCollection();
    await Feedback.createCollection();
    await ChatLog.createCollection();
    await SupportChat.createCollection();
    await Notification.createCollection();
    
    console.log('✅ Collections created successfully');
    
    // Create admin user
    console.log('\n👤 Creating admin user...');
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123', 10);
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin user created:');
      console.log('   Email: admin@gmail.com');
      console.log('   Password: Admin123');
      console.log('   ⚠️  Please change the password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create indexes
    console.log('\n📇 Creating indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await Order.collection.createIndex({ user: 1, createdAt: -1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ paymentStatus: 1 });
    console.log('✅ Indexes created');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Collections created:');
    console.log('   - users');
    console.log('   - menuitems');
    console.log('   - orders');
    console.log('   - carts');
    console.log('   - feedbacks');
    console.log('   - chatlogs');
    console.log('   - supportchats');
    console.log('   - notifications');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('   💡 Check your username and password in MONGODB_URI');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   💡 Check your connection string and network access in MongoDB Atlas');
    }
    process.exit(1);
  }
};

connectAndSetup();

