const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Create chef account
// @route   POST /api/admin/create-chef
// @access  Admin only
const createChef = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create chef
    const chef = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'chef',
    });

    res.status(201).json({
      success: true,
      message: 'Chef account created successfully',
      data: {
        id: chef._id,
        name: chef.name,
        email: chef.email,
        role: chef.role,
      },
    });
  } catch (error) {
    console.error('Create chef error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get all chefs
// @route   GET /api/admin/chefs
// @access  Admin only
const getChefs = async (req, res) => {
  try {
    const chefs = await User.find({ role: 'chef' }).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: chefs,
    });
  } catch (error) {
    console.error('Get chefs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin user',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin only
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalChefs = await User.countDocuments({ role: 'chef' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const cookingOrders = await Order.countDocuments({ status: 'cooking' });
    const readyOrders = await Order.countDocuments({ status: 'ready' });

    // Calculate total sales (all paid orders)
    const totalSalesResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesResult = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: today }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const todaySales = todaySalesResult.length > 0 ? todaySalesResult[0].total : 0;

    // Calculate this month's sales
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthSalesResult = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const monthSales = monthSalesResult.length > 0 ? monthSalesResult[0].total : 0;

    // Get most sold items
    const mostSoldItems = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.item',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        } 
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          name: '$itemDetails.name',
          image: '$itemDetails.image',
          category: '$itemDetails.category',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Get pending payment orders
    const pendingPayments = await Order.countDocuments({ paymentStatus: 'pending' });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalChefs,
        totalOrders,
        pendingOrders,
        cookingOrders,
        readyOrders,
        totalSales,
        todaySales,
        monthSales,
        mostSoldItems,
        pendingPayments,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  createChef,
  getUsers,
  getChefs,
  deleteUser,
  getStats,
};

