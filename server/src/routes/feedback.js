const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getFeedbacks,
  getItemFeedbacks,
  getChefFeedbacks,
  getMyFeedbacks,
  updateFeedback,
  deleteFeedback,
  getRatingStats,
} = require('../controllers/feedbackController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getFeedbacks);
router.get('/stats/ratings', getRatingStats);
router.get('/item/:id', getItemFeedbacks);

// Protected routes - Chef only
router.get('/chef', auth, authorize('chef'), getChefFeedbacks);

// Protected routes - User only
router.post('/', auth, authorize('user'), createFeedback);
router.get('/my', auth, authorize('user'), getMyFeedbacks);
router.put('/:id', auth, authorize('user'), updateFeedback);
router.delete('/:id', auth, authorize('user', 'admin'), deleteFeedback);

module.exports = router;

