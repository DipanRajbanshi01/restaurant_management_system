const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Migration script to update User model with new fields
 * - Ensures all existing users have isGoogleUser: false
 * - Adds default values for new fields if missing
 */
const migrateUsers = async () => {
  try {
    console.log('🔄 Starting user model migration...');

    // Find users that don't have isGoogleUser field or have null/undefined
    const usersToUpdate = await User.find({
      $or: [
        { isGoogleUser: { $exists: false } },
        { isGoogleUser: null },
        { isGoogleUser: undefined }
      ]
    });

    if (usersToUpdate.length === 0) {
      console.log('✅ All users already have isGoogleUser field. No migration needed.');
      return;
    }

    console.log(`📝 Found ${usersToUpdate.length} users without isGoogleUser field.`);

    // Update all users to have isGoogleUser: false
    const result = await User.updateMany(
      {
        $or: [
          { isGoogleUser: { $exists: false } },
          { isGoogleUser: null },
          { isGoogleUser: undefined }
        ]
      },
      {
        $set: { isGoogleUser: false }
      }
    );

    console.log(`✅ User model migration completed successfully!`);
    console.log(`   Updated ${result.modifiedCount} users with isGoogleUser: false.`);
    console.log('   💡 All existing users are now marked as non-Google users.');

  } catch (error) {
    console.error('❌ User model migration failed:', error);
    throw error;
  }
};

module.exports = migrateUsers;

