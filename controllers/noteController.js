const Note = require('../models/Note');

// @desc    Get notes (own notes for user, all for admin) with pagination
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    let query = {};
    // Regular users only see their own notes
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Note.countDocuments(query),
    ]);

    res.json({
      notes,
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

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('user', 'name email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Users can only view their own notes; admins can view any
    if (
      req.user.role !== 'admin' &&
      note.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this note' });
    }

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    const note = await Note.create({
      title,
      content,
      user: req.user._id,
    });

    const populated = await Note.findById(note._id).populate('user', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner or admin can update
    if (
      req.user.role !== 'admin' &&
      note.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }

    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;

    const updated = await note.save();
    const populated = await Note.findById(updated._id).populate('user', 'name email');
    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner or admin can delete
    if (
      req.user.role !== 'admin' &&
      note.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
