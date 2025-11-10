const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!adminExists) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin123', 10);
      
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
      
      console.log('✅ Admin user created successfully:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing admin:', error.message);
  }
};

module.exports = initAdmin;

