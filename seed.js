/**
 * Seed script — creates sample admin + user and a few notes/posts.
 * Run: node seed.js  (from backend folder, with MongoDB running)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Note = require('./models/Note');
const Post = require('./models/Post');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([User.deleteMany({}), Note.deleteMany({}), Post.deleteMany({})]);
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      interests: ['security', 'chess', 'reading'],
    });

    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      interests: ['chess', 'coding'],
    });

    const user2 = await User.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'alice123',
      role: 'user',
      interests: ['reading', 'music'],
    });

    await Note.create([
      { title: 'Admin Note 1', content: 'Secret admin note content', user: admin._id },
      { title: 'User Note 1', content: 'My first note', user: user._id },
      { title: 'User Note 2', content: 'Another personal note', user: user._id },
      { title: 'Alice Note', content: 'Hello from Alice', user: user2._id },
    ]);

    await Post.create([
      { title: 'Welcome Post', content: 'Public post by admin', author: admin._id },
      { title: 'Chess Tips', content: 'Always control the center', author: user._id },
      { title: 'Reading List', content: 'Currently reading Clean Code', author: user2._id },
    ]);

    console.log('Seed complete!');
    console.log('Admin: admin@example.com / admin123');
    console.log('User:  user@example.com / user123');
    console.log('Alice: alice@example.com / alice123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
