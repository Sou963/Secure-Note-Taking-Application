const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    // Author of the post (public posts)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for retrieving posts by a particular user (author) with pagination
postSchema.index({ author: 1, createdAt: -1 });

// Index for listing all public posts with pagination
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
