const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderNotes,
  updateEstimatedTime,
} = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// User can create orders
router.post('/', authorize('user'), createOrder);

// All authenticated users can view orders (filtered by role)
router.get('/', getOrders);
router.get('/:id', getOrder);

// Chef and Admin can update order status, Users can mark as completed
router.put('/:id/status', authorize('chef', 'admin', 'user'), updateOrderStatus);

// User can update payment status
router.put('/:id/payment', authorize('user'), updatePaymentStatus);

// Update order notes
router.put('/:id/notes', authorize('user', 'admin'), updateOrderNotes);

// Update estimated time (Chef/Admin only)
router.put('/:id/estimated-time', authorize('chef', 'admin'), updateEstimatedTime);

module.exports = router;

