const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes'); // Make sure to create this file

// Initialize Express app
const app = express();

// Connect Database
require('dotenv').config();
connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes); // Use the correct route for your game logic

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Bingo Game API');
});

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('joinGame', (gameId) => {
    socket.join(gameId);
    console.log(`User joined game ${gameId}`);
  });

  socket.on('bingo', (gameId, data) => {
    io.to(gameId).emit('bingoCalled', data);
    console.log(`Bingo called in game ${gameId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
