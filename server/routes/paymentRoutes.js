const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Deposit money
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ msg: 'Invalid amount' });

    const user = await User.findById(req.user.id);
    user.balance += amount;
    await user.save();

    res.json({ balance: user.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Check balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
