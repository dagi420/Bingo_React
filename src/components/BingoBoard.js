// src/components/BingoBoard.js
import React, { useState, useEffect } from 'react';

const generateBingoCard = () => {
  // Simple Bingo card generator
  const card = [];
  for (let i = 0; i < 25; i++) {
    card.push(Math.floor(Math.random() * 75) + 1); // Numbers between 1 and 75
  }
  return card;
};

const BingoBoard = () => {
  const [card, setCard] = useState([]);

  useEffect(() => {
    setCard(generateBingoCard());
  }, []);

  return (
    <div className="bingo-board">
      {card.map((number, index) => (
        <div key={index} className="bingo-cell">
          {number}
        </div>
      ))}
    </div>
  );
};

export default BingoBoard;
