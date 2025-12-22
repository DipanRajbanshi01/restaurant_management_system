const Feedback = require('../models/Feedback');
const MenuItem = require('../models/MenuItem');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create feedback
// @route   POST /api/feedback
// @access  User only
const createFeedback = async (req, res) => {
  try {
    const { menuItem, order, rating, comment } = req.body;

    // Check if menu item exists (if provided)
    if (menuItem) {
      const menuItemExists = await MenuItem.findById(menuItem);
      if (!menuItemExists) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found',
        });
      }

      // Check if user already gave feedback for this item
      const existingFeedback = await Feedback.findOne({
        user: req.user.id,
        menuItem,
      });

      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          message: 'You have already given feedback for this item. Please edit your existing feedback.',
        });
      }
    }

    // Check if order exists and belongs to user (if provided)
    if (order) {
      const Order = require('../models/Order');
      const orderExists = await Order.findOne({ _id: order, user: req.user.id });
      if (!orderExists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or does not belong to you',
        });
      }

      // Check if order is completed
      if (orderExists.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'You can only give feedback for completed orders',
        });
      }

      // Check if user already gave feedback for this order
      const existingFeedback = await Feedback.findOne({
        user: req.user.id,
        order,
      });

      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          message: 'You have already given feedback for this order. Please edit your existing feedback.',
        });
      }
    }

    // Create feedback
    const feedback = await Feedback.create({
      user: req.user.id,
      menuItem: menuItem || undefined,
      order: order || undefined,
      rating,
      comment,
    });

    // If rating is low (<3), notify admin
    if (rating < 3) {
      const admins = await User.find({ role: 'admin' });
      const feedbackPopulated = await Feedback.findById(feedback._id)
        .populate('user', 'name')
        .populate('menuItem', 'name')
        .populate('order');

      for (const admin of admins) {
        let subject;
        if (feedbackPopulated.menuItem) {
          subject = `"${feedbackPopulated.menuItem.name}"`;
        } else if (feedbackPopulated.order) {
          subject = `Order #${feedbackPopulated.order._id.toString().slice(-6)}`;
        } else {
          subject = 'General Restaurant Experience';
        }
        
        await Notification.create({
          userId: admin._id,
          message: `Low rating (${rating}⭐) received for ${subject} from ${feedbackPopulated.user.name}`,
          type: 'feedback',
          feedbackId: feedback._id,
        });
      }
    }

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate('menuItem', 'name')
      .populate('order');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: populatedFeedback,
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get all feedbacks with pagination
// @route   GET /api/feedback?page=1&limit=10
// @access  Public
const getFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .populate('menuItem', 'name image')
      .populate('order')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments();

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get feedbacks for a specific menu item
// @route   GET /api/feedback/item/:id
// @access  Public
const getItemFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ menuItem: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

    res.json({
      success: true,
      data: {
        feedbacks,
        averageRating: avgRating.toFixed(1),
        totalFeedbacks: feedbacks.length,
      },
    });
  } catch (error) {
    console.error('Get item feedbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get feedbacks for chef
// @route   GET /api/feedback/chef
// @access  Chef
const getChefFeedbacks = async (req, res) => {
  try {
    const Order = require('../models/Order');
    
    // Get all menu item feedbacks (all chefs can see these)
    const menuFeedbacks = await Feedback.find({ menuItem: { $exists: true, $ne: null } })
      .populate('user', 'name')
      .populate('menuItem', 'name image')
      .sort({ createdAt: -1 });

    // Get only order feedbacks for orders handled by this chef
    const chefOrders = await Order.find({ chef: req.user.id }).select('_id');
    const chefOrderIds = chefOrders.map(order => order._id);

    const orderFeedbacks = await Feedback.find({ 
      order: { $in: chefOrderIds } 
    })
      .populate('user', 'name')
      .populate('order')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        menuFeedbacks,
        orderFeedbacks,
        totalMenuFeedbacks: menuFeedbacks.length,
        totalOrderFeedbacks: orderFeedbacks.length,
      },
    });
  } catch (error) {
    console.error('Get chef feedbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get user's own feedbacks
// @route   GET /api/feedback/my
// @access  User
const getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id })
      .populate('menuItem', 'name image price')
      .populate('order')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error('Get my feedbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  User (own feedback only)
const updateFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Check if user owns this feedback
    if (feedback.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback',
      });
    }

    // Update fields
    if (rating !== undefined) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;

    await feedback.save();

    // If rating is low (<3), notify admin
    if (rating < 3) {
      const admins = await User.find({ role: 'admin' });
      const feedbackPopulated = await Feedback.findById(feedback._id)
        .populate('user', 'name')
        .populate('menuItem', 'name');

      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          message: `Updated low rating (${rating}⭐) for "${feedbackPopulated.menuItem.name}" from ${feedbackPopulated.user.name}`,
          type: 'feedback',
          feedbackId: feedback._id,
        });
      }
    }

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate('menuItem', 'name');

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback,
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  User (own feedback only) or Admin
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Check if user owns this feedback or is admin
    if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback',
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get average ratings for all menu items
// @route   GET /api/feedback/stats/ratings
// @access  Public
const getRatingStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$menuItem',
          averageRating: { $avg: '$rating' },
          totalFeedbacks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem',
        },
      },
      {
        $unwind: '$menuItem',
      },
      {
        $project: {
          menuItemId: '$_id',
          menuItemName: '$menuItem.name',
          averageRating: { $round: ['$averageRating', 1] },
          totalFeedbacks: 1,
        },
      },
      {
        $sort: { averageRating: -1 },
      },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getItemFeedbacks,
  getChefFeedbacks,
  getMyFeedbacks,
  updateFeedback,
  deleteFeedback,
  getRatingStats,
};

