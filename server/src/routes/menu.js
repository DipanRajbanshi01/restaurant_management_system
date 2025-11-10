const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

// Admin only routes
router.post('/', auth, authorize('admin'), createMenuItem);
router.put('/:id', auth, authorize('admin'), updateMenuItem);
router.delete('/:id', auth, authorize('admin'), deleteMenuItem);

module.exports = router;

