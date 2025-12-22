const mongoose = require('mongoose');
const SupportChat = require('../models/SupportChat');

/**
 * Migration script to ensure SupportChat collection and indexes are properly set up
 * - Creates indexes for better query performance
 * - This is a new collection, so no data migration is needed
 */
const migrateSupportChat = async () => {
  try {
    console.log('🔄 Starting SupportChat model migration...');

    // Ensure indexes exist (Mongoose will create them if they don't exist)
    // Use createIndexes which is safer and handles existing indexes
    try {
      await SupportChat.createIndexes();
      console.log('✅ SupportChat indexes created/verified successfully!');
      console.log('   📊 Indexes:');
      console.log('      - user + createdAt (compound)');
      console.log('      - status');
      console.log('      - assignedAdmin');
    } catch (error) {
      // If indexes already exist or are being built, that's okay
      if (error.code === 85 || error.code === 276) {
        console.log('⚠️ SupportChat indexes may already exist or are being built - this is okay');
      } else {
        console.error('⚠️ SupportChat index creation warning:', error.message);
        // Don't throw - indexes might already exist
      }
    }
  } catch (error) {
    // Don't throw - log and continue
    console.error('⚠️ SupportChat migration warning (non-critical):', error.message);
    console.log('   Migration will continue - indexes may need manual verification');
  }
};

module.exports = migrateSupportChat;

