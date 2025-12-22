const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

/**
 * Migration script to add tags field to existing menu items
 * This ensures all menu items have the tags array for chatbot recommendations
 */
const migrateMenuTags = async () => {
  try {
    console.log('🔄 Starting menu tags migration...');

    // Find all menu items that don't have tags field or have undefined/null tags
    const itemsWithoutTags = await MenuItem.find({
      $or: [
        { tags: { $exists: false } },
        { tags: null },
        { tags: undefined }
      ]
    });

    if (itemsWithoutTags.length === 0) {
      console.log('✅ All menu items already have tags field. No migration needed.');
      return;
    }

    console.log(`📝 Found ${itemsWithoutTags.length} menu items without tags field.`);

    // Update all items to have empty tags array
    const result = await MenuItem.updateMany(
      {
        $or: [
          { tags: { $exists: false } },
          { tags: null },
          { tags: undefined }
        ]
      },
      {
        $set: { tags: [] }
      }
    );

    console.log(`✅ Menu tags migration completed successfully!`);
    console.log(`   Updated ${result.modifiedCount} menu items with empty tags array.`);
    console.log('   💡 Admins can now add tags to items for better chatbot recommendations.');

  } catch (error) {
    console.error('❌ Menu tags migration failed:', error);
    throw error;
  }
};

module.exports = migrateMenuTags;

