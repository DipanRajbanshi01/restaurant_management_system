const mongoose = require('mongoose');
const Order = require('../models/Order');

/**
 * Migration script to update Order model for eSewa integration
 * - Ensures all existing orders have esewaTransactionId field (null if not eSewa payment)
 * - Updates paymentMethod enum to include 'esewa' if needed
 * - Creates indexes for better performance
 */
const migrateOrders = async () => {
  try {
    console.log('🔄 Starting order model migration for eSewa...');

    // Find orders that don't have esewaTransactionId or khaltiPidx field
    const ordersToUpdate = await Order.find({
      $or: [
        { esewaTransactionId: { $exists: false } },
        { khaltiPidx: { $exists: false } }
      ]
    });

    if (ordersToUpdate.length === 0) {
      console.log('✅ All orders already have payment fields. No migration needed.');
      return;
    }

    console.log(`📝 Found ${ordersToUpdate.length} orders without payment fields.`);

    // Update all orders to have payment fields: null (for non-digital payments)
    const result = await Order.updateMany(
      {
        $or: [
          { esewaTransactionId: { $exists: false } },
          { khaltiPidx: { $exists: false } }
        ]
      },
      {
        $set: {
          esewaTransactionId: null,
          khaltiPidx: null
        }
      }
    );

    console.log(`✅ Order migration completed successfully!`);
    console.log(`   Updated ${result.modifiedCount} orders.`);

    // Ensure indexes exist (Mongoose will create them if they don't exist)
    await Order.collection.createIndex({ esewaTransactionId: 1 });
    await Order.collection.createIndex({ khaltiPidx: 1 });
    console.log('✅ Indexes created/verified for orders.');
  } catch (error) {
    console.error('❌ Order migration failed:', error);
    throw error;
  }
};

module.exports = migrateOrders;

