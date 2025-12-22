const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const User = require('../models/User');

/**
 * Migration script to create cart entries for existing users
 * This ensures all users have a cart document in the database
 * Note: This doesn't migrate localStorage carts (that would require frontend migration)
 */
const migrateCarts = async () => {
  try {
    console.log('🔄 Starting cart migration...');

    // Find all users without a cart
    const users = await User.find({ role: 'user' });
    let cartsCreated = 0;

    for (const user of users) {
      const existingCart = await Cart.findOne({ user: user._id });
      if (!existingCart) {
        await Cart.create({
          user: user._id,
          items: [],
        });
        cartsCreated++;
      }
    }

    if (cartsCreated === 0) {
      console.log('✅ All users already have cart documents. No migration needed.');
    } else {
      console.log(`✅ Cart migration completed successfully!`);
      console.log(`   Created ${cartsCreated} cart documents for existing users.`);
    }
  } catch (error) {
    console.error('❌ Cart migration failed:', error);
    throw error;
  }
};

module.exports = migrateCarts;

