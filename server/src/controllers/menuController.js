const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ available: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin only
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, tags, image } = req.body;

    const item = await MenuItem.create({
      name,
      description,
      price,
      category: category || 'Others',
      tags: tags || [],
      image: image || '',
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: item,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin only
const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, tags, image, available } = req.body;

    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, tags, image, available },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: item,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin only
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Create chef's special
// @route   POST /api/menu/chef-special
// @access  Chef only
const createChefSpecial = async (req, res) => {
  try {
    const { name, description, price, category, tags, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item name and price',
      });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category: category || 'Others',
      tags: tags || [],
      image: image || '',
      isChefSpecial: true,
      specialDate: new Date(),
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Chef's special created successfully",
      data: item,
    });
  } catch (error) {
    console.error("Create chef's special error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Remove chef's special
// @route   DELETE /api/menu/chef-special/:id
// @access  Chef only
const removeChefSpecial = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ 
      _id: req.params.id, 
      isChefSpecial: true 
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Chef's special not found",
      });
    }

    // Only the chef who created it can remove it, or any chef can remove old specials
    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Chef's special removed successfully",
    });
  } catch (error) {
    console.error("Remove chef's special error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createChefSpecial,
  removeChefSpecial,
};

