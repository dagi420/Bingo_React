const mongoose = require('mongoose');

const connectDB = async () => {
  const dbURI = 'mongodb://localhost:27017/bingo_game_bot'; // Replace with your MongoDB URI

  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Mongoose connected to ' + dbURI);
  } catch (err) {
    console.error('Mongoose connection error: ' + err);
    process.exit(1); // Exit process with failure
  }
};

// Event listeners for connection events (optional but useful)
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

module.exports = connectDB;
