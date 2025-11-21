const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  updatePassword, 
  toggleFavorite, 
  getFavorites, 
  updateTheme 
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// User profile routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);

// Favorites routes
router.get('/favorites', auth, getFavorites);
router.post('/favorites/:itemId', auth, toggleFavorite);

// Theme route
router.put('/theme', auth, updateTheme);

module.exports = router;

