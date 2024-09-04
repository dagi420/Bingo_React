const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');
const connectDB = require('./config/db');
const fetch = require('node-fetch');
const socketIO = require('socket.io');
const http = require('http');

// Connect to the database
connectDB();

const token = '6371705475:AAHk8-26BOmdM9WNHZMdIQtfYM5vXoGecnU'; // Replace with your actual token
const bot = new TelegramBot(token, { polling: true });

// Initialize user states for registration process
const userStates = {};

// Create HTTP server and initialize Socket.IO
const server = http.createServer();
const io = socketIO(server, {
  cors: {
    origin: '*',
  },
});

// Handle Socket.IO connection
io.on('connection', (socket) => {
  const { userId, gameId } = socket.handshake.query;

  console.log(`User connected: ${userId} to game: ${gameId}`);

  // Emit allSelectedCards event
  socket.emit('allSelectedCards', {
    userId,
    gameId,
    cardSelections: {}, // Replace with actual card selections
  });

  // Handle selectCard event
  socket.on('selectCard', (data) => {
    const { cardId, lockedIn } = data;
    // Handle card selection logic
    io.to(gameId).emit('cardSelected', {
      cardId,
      isSelected: true,
      userId,
      lockedIn,
    });
  });

  // Handle bingo event
  socket.on('bingo', (data) => {
    const { cardId } = data;
    // Handle bingo logic
    io.to(gameId).emit('winner', {
      message: 'Bingo',
      user: userId, // Replace with actual user name
    });
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    // Handle disconnection logic
  });
});

// Start the server
server.listen(5000, () => {
  console.log('Socket.IO server running on port 5000');
});

// Telegram Bot Commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to the Bingo game bot! Use /register to register and start playing.');
});

bot.onText(/\/register/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  if (!username) {
    bot.sendMessage(chatId, 'You need a username to register. Please set a username in your Telegram settings.');
    return;
  }

  userStates[chatId] = { step: 'awaiting_contact' };

  bot.sendMessage(chatId, 'Please share your contact information for registration.', {
    reply_markup: {
      keyboard: [
        [{ text: 'Share Contact', request_contact: true }],
        [{ text: 'Cancel' }]
      ],
      one_time_keyboard: true
    }
  });
});

bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const contact = msg.contact;

  if (!userStates[chatId] || userStates[chatId].step !== 'awaiting_contact') return;

  userStates[chatId].phoneNumber = contact.phone_number;
  userStates[chatId].step = 'awaiting_confirmation';

  bot.sendMessage(chatId, `You shared the phone number: ${contact.phone_number}. Do you want to proceed with this phone number?`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Accept', callback_data: 'accept' }],
        [{ text: 'Cancel', callback_data: 'cancel' }]
      ]
    }
  });
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (!userStates[chatId]) {
    bot.sendMessage(chatId, 'No registration process found.');
    return;
  }

  if (data === 'accept') {
    try {
      const userState = userStates[chatId];
      const phoneNumber = userState.phoneNumber;
      const username = callbackQuery.from.username;

      let user = await User.findOne({ phoneNumber });
      if (user) {
        bot.sendMessage(chatId, 'You are already registered.');
      } else {
        const token = uuidv4();
        user = new User({ phoneNumber, username, token });
        await user.save();
      }

      const playUrl = `http://localhost:3000/game/${username}`;
      bot.sendMessage(chatId, `Registration successful! Click [here](${playUrl}) to start playing!`, { parse_mode: 'Markdown' });

      delete userStates[chatId];

    } catch (err) {
      bot.sendMessage(chatId, 'An error occurred while processing your registration. Please try again later.');
      console.error('Error during registration:', err);
    }
  } else if (data === 'cancel') {
    bot.sendMessage(chatId, 'Registration canceled.');
    delete userStates[chatId];
  }
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch('http://localhost:5000/api/users/balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_JWT_TOKEN`
      }
    });

    const result = await response.json();
    bot.sendMessage(chatId, `Your balance is: ${result.balance}`);
  } catch (err) {
    bot.sendMessage(chatId, 'Failed to retrieve your balance. Please try again later.');
    console.error('Error retrieving balance:', err);
  }
});

bot.onText(/\/deposit (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const amount = parseInt(match[1], 10);

  if (isNaN(amount) || amount <= 0) {
    bot.sendMessage(chatId, 'Please enter a valid amount to deposit.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/users/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_JWT_TOKEN`
      },
      body: JSON.stringify({ amount })
    });

    const result = await response.json();
    if (result.success) {
      bot.sendMessage(chatId, `Successfully deposited ${amount}. Your new balance is: ${result.balance}`);
    } else {
      bot.sendMessage(chatId, `Failed to deposit money: ${result.message}`);
    }
  } catch (err) {
    bot.sendMessage(chatId, 'Failed to deposit money. Please try again later.');
    console.error('Error during deposit:', err);
  }
});
bot.onText(/\/play/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  console.log(`Received /play command from user: ${username}`);

  if (!username) {
    bot.sendMessage(chatId, 'You need a username to play the game. Please set a username in your Telegram settings.');
    return;
  }

  try {
    const playUrl = `https://giftbingo.netlify.app/?username=${encodeURIComponent(username)}`;
    console.log(`Generated play URL: ${playUrl}`);

    bot.sendMessage(chatId, `Click [here](${playUrl}) to start playing the game!`, { parse_mode: 'Markdown' });
    console.log(`Sent play URL to user: ${username}`);
  } catch (err) {
    bot.sendMessage(chatId, 'An error occurred while generating the game link. Please try again later.');
    console.error('Error generating game link:', err);
  }
});