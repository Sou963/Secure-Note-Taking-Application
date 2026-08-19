const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  getPostsByUser,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Public list
router.get('/', getPosts);

// Create requires auth
router.post('/', protect, createPost);

// Aggregation with $lookup - must be before any generic :id if added later
router.get('/user/:userId', getPostsByUser);

module.exports = router;
