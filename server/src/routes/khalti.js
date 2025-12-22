const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  initiatePayment,
  verifyPayment,
  handleCallback,
} = require('../controllers/khaltiController');

// Public route (called by Khalti)
router.get('/callback', handleCallback);

// Protected routes
router.post('/initiate', auth, authorize('user'), initiatePayment);
router.post('/verify', auth, verifyPayment);

module.exports = router;

