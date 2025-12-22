const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getCart,
  updateCart,
  clearCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
} = require('../controllers/cartController');

// All routes require authentication
router.use(auth);

// Cart routes
router.get('/', getCart);
router.put('/', updateCart);
router.delete('/', clearCart);
router.post('/add', addToCart);
router.delete('/item/:itemId', removeFromCart);
router.put('/item/:itemId', updateItemQuantity);

module.exports = router;

