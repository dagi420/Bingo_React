// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Import the auth middleware

// Register a new user
router.post('/register', async (req, res) => {
  const { phoneNumber, username } = req.body;
  try {
    let user = await User.findOne({ phoneNumber });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ phoneNumber, username });

    // Assuming no password for simplicity; you might want to add a password field
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 360000 });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module
// Get user info
router.get('/', auth, async (req, res) => { // Using the auth middleware here
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
