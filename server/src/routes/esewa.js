const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  initiatePayment,
  verifyPayment,
  handleSuccess,
  handleFailure,
} = require('../controllers/esewaController');

// Public routes (called by eSewa)
router.get('/success', handleSuccess);
router.get('/failure', handleFailure);

// Protected routes
router.post('/initiate', auth, authorize('user'), initiatePayment);
router.post('/verify', auth, verifyPayment);

module.exports = router;

