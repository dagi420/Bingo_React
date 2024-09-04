const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  numbers: [[Number]],
  isChosen: { type: Boolean, default: false }
});

module.exports = mongoose.model('Card', CardSchema);
