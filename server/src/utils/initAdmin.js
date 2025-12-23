const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    // Check if admin already exists
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin123', 10);
      
      const newAdmin = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
      
      console.log('✅ Admin user created successfully:', newAdmin.email);
      console.log('   Default password: Admin123');
    } else {
      // Admin exists - reset password to default (in case it was changed or corrupted)
      // This ensures admin can always login with default password
      admin.password = 'Admin123'; // Will be hashed by pre-save hook
      await admin.save();
      
      console.log('✅ Admin user found - password reset to default');
      console.log('   Email: admin@gmail.com');
      console.log('   Password: Admin123');
      console.log('   ⚠️  Please change the password after first login!');
    }
  } catch (error) {
    console.error('❌ Error initializing admin:', error.message);
  }
};

module.exports = initAdmin;

