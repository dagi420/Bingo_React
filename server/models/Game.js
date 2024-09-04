const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
  active: { type: Boolean, default: true },
  startTime: { type: Date },
  endTime: { type: Date },
  winner: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Game', GameSchema);
