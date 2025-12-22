const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
require('dotenv').config();

const migrateMenuItems = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management');
    console.log('Connected to MongoDB');

    // Update all items that don't have a category field
    const result = await MenuItem.updateMany(
      { 
        $or: [
          { category: { $exists: false } },
          { category: null },
          { category: '' }
        ]
      },
      { 
        $set: { category: 'Others' } 
      }
    );

    console.log(`Migration completed! Updated ${result.modifiedCount} menu items.`);
    
    // Show all items with their categories
    const allItems = await MenuItem.find({}, 'name category');
    console.log('\nAll menu items:');
    allItems.forEach(item => {
      console.log(`  - ${item.name}: ${item.category}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateMenuItems();

