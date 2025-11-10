const express = require('express');
const router = express.Router();
const { register, login, verifyToken } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected route
router.get('/verify', auth, verifyToken);

module.exports = router;

