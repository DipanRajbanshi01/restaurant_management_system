const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
} = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// User can create orders
router.post('/', authorize('user'), createOrder);

// All authenticated users can view orders (filtered by role)
router.get('/', getOrders);
router.get('/:id', getOrder);

// Chef and Admin can update order status
router.put('/:id/status', authorize('chef', 'admin'), updateOrderStatus);

// User can update payment status
router.put('/:id/payment', authorize('user'), updatePaymentStatus);

module.exports = router;

