const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Card = require('../models/Card');
const auth = require('../middleware/auth');

// Start a new game
router.post('/start', auth, async (req, res) => {
  try {
    const newGame = new Game({
      players: [req.user.id],
      startTime: new Date()
    });
    await newGame.save();
    res.json(newGame);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Join a game
router.post('/join/:gameId', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) return res.status(404).json({ msg: 'Game not found' });

    // Add player to the game
    game.players.push(req.user.id);
    await game.save();
    
    // Add card to the game
    const card = await Card.findById(req.body.cardId);
    if (!card) return res.status(404).json({ msg: 'Card not found' });
    
    game.cards.push(card);
    await game.save();

    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Mark bingo
router.post('/bingo/:gameId', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) return res.status(404).json({ msg: 'Game not found' });
    
    // Check if the user is part of the game
    if (!game.players.includes(req.user.id)) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // Check if the card is part of the game
    const card = await Card.findById(req.body.cardId);
    if (!card) return res.status(404).json({ msg: 'Card not found' });

    // Validate bingo
    if (card.isBingo()) {
      game.winner = req.user.id;
      game.active = false;
      await game.save();
      res.json({ msg: 'Congratulations, you won!' });
    } else {
      res.status(400).json({ msg: 'Not a valid bingo' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

// Start Game Endpoint
router.post('/start', auth, async (req, res) => {
  try {
    // Logic to start the game
    const gameUrl = 'https://your-mini-app-url.com'; // URL to your mini-app
    res.json({ gameUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
