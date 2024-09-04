const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0, // Starting balance for the user
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a model from the schema and export it
const User = mongoose.model('User', userSchema);
module.exports = User;
