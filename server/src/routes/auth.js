const express = require('express');
const router = express.Router();
const { register, login, verifyToken, googleAuth, completeGoogleProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleAuth);
router.post('/google/complete-profile', auth, completeGoogleProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected route
router.get('/verify', auth, verifyToken);

module.exports = router;

