const express = require('express');
const router = express.Router();
const {
  createChef,
  getUsers,
  getChefs,
  deleteUser,
  getStats,
} = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(auth);
router.use(authorize('admin'));

router.post('/create-chef', createChef);
router.get('/users', getUsers);
router.get('/chefs', getChefs);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

module.exports = router;

