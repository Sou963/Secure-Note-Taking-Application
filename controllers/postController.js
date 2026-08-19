const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all public posts with pagination
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(),
    ]);

    res.json({
      posts,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create a public post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user._id,
    });

    const populated = await Post.findById(post._id).populate('author', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get posts belonging to a particular user via $lookup aggregation
// @route   GET /api/posts/user/:userId
// @access  Public
// Constraint: single aggregation pipeline that contains a $lookup stage
const getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Single aggregation pipeline with $lookup
    const result = await User.aggregate([
      { $match: { _id: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'author',
          as: 'posts',
          pipeline: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                title: 1,
                content: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          posts: 1,
          postCount: { $size: '$posts' },
        },
      },
    ]);

    if (!result.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also get total count of posts for pagination metadata
    const total = await Post.countDocuments({ author: userId });

    res.json({
      user: {
        _id: result[0]._id,
        name: result[0].name,
        email: result[0].email,
      },
      posts: result[0].posts,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getPosts,
  createPost,
  getPostsByUser,
};
