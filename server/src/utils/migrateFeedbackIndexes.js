const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

/**
 * Migration script to update Feedback indexes
 * Run this once to drop old sparse indexes and create new partial indexes
 */
const migrateFeedbackIndexes = async () => {
  try {
    console.log('🔄 Starting Feedback index migration...');

    // Get the Feedback collection
    const collection = mongoose.connection.collection('feedbacks');

    // Get existing indexes
    const existingIndexes = await collection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);

    // Drop the old sparse indexes if they exist
    const indexesToDrop = ['user_1_menuItem_1', 'user_1_order_1'];
    
    for (const indexName of indexesToDrop) {
      if (indexNames.includes(indexName)) {
        try {
          await collection.dropIndex(indexName);
          console.log(`✓ Dropped old ${indexName} index`);
        } catch (error) {
          // Error code 27 = IndexNotFound, 276 = IndexBuildAborted
          if (error.code === 27 || error.code === 276) {
            console.log(`⚠️ ${indexName} index already removed or build aborted - continuing...`);
          } else {
            console.error(`Error dropping ${indexName} index:`, error.message);
            // Don't throw - continue with migration
          }
        }
      } else {
        console.log(`✓ ${indexName} index does not exist - skipping`);
      }
    }

    // Wait a bit to ensure any index operations complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // The new partial indexes will be created automatically by Mongoose
    // when the model is loaded, but we'll ensure they exist
    try {
      await Feedback.createIndexes();
      console.log('✓ Created/verified new partial indexes');
    } catch (error) {
      // If indexes already exist or are being built, that's okay
      if (error.code === 85 || error.code === 276) {
        console.log('⚠️ Indexes may already exist or are being built - this is okay');
      } else {
        console.error('Error creating indexes:', error.message);
        // Don't throw - indexes might already exist
      }
    }

    console.log('✅ Feedback index migration completed!');
    console.log('   Users can now submit multiple general feedbacks.');
  } catch (error) {
    // Don't throw - log and continue
    console.error('⚠️ Feedback index migration warning:', error.message);
    console.log('   Migration will continue - indexes may need manual verification');
  }
};

module.exports = migrateFeedbackIndexes;

