const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for listing a user's own notes (user + pagination by createdAt)
noteSchema.index({ user: 1, createdAt: -1 });

// Index for admin viewing all notes (pagination by createdAt)
noteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
