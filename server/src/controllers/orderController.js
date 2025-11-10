const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Create order
// @route   POST /api/orders
// @access  User only
const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      totalPrice,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.item', 'name price');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get orders
// @route   GET /api/orders
// @access  User/Chef/Admin
const getOrders = async (req, res) => {
  try {
    let query = {};

    // Users can only see their own orders
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }
    // Chefs can see pending and cooking orders
    else if (req.user.role === 'chef') {
      query.status = { $in: ['pending', 'cooking'] };
    }
    // Admin can see all orders

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('chef', 'name email')
      .populate('items.item', 'name price image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  User/Chef/Admin
const getOrder = async (req, res) => {
  try {
    let query = { _id: req.params.id };

    // Users can only see their own orders
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email')
      .populate('chef', 'name email')
      .populate('items.item', 'name price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Chef/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const io = req.app.get('io');

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update order
    order.status = status;
    if (req.user.role === 'chef' && status === 'cooking') {
      order.chef = req.user.id;
    }
    await order.save();

    // If order is marked as ready, send notification
    if (status === 'ready') {
      const notification = await Notification.create({
        userId: order.user._id,
        message: `Your order #${order._id} is ready!`,
        orderId: order._id,
      });

      // Emit socket event to user
      io.to(`user-${order.user._id}`).emit('order-ready', {
        orderId: order._id,
        message: notification.message,
      });
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('chef', 'name email')
      .populate('items.item', 'name price image');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  User
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
};
