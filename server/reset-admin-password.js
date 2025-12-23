require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const resetAdminPassword = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set in .env file');
      console.warn('⚠️  Using default: mongodb://localhost:27017/restaurant-management');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('💡 Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin123', 10);
      const newAdmin = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@gmail.com');
      console.log('   Password: Admin123');
    } else {
      console.log('✅ Admin user found!');
      console.log('🔄 Resetting password to: Admin123');
      
      // Reset password
      admin.password = 'Admin123'; // Will be hashed by pre-save hook
      await admin.save();
      
      console.log('✅ Admin password reset successfully!');
      console.log('   Email: admin@gmail.com');
      console.log('   Password: Admin123');
      console.log('   ⚠️  Please change the password after first login!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('   💡 Check your username and password in MONGODB_URI');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   💡 Check your connection string and network access in MongoDB Atlas');
    }
    process.exit(1);
  }
};

resetAdminPassword();

