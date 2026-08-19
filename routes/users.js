const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  groupByInterests,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Specific routes before parameterized ones
router.get('/group-by-interests', protect, admin, groupByInterests);

router
  .route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
