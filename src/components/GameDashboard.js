import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GameDashboard = () => {
  const { username } = useParams();
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/games/state/${username}`);
        const data = await response.json();
        setGameState(data);
      } catch (error) {
        console.error('Failed to fetch game state:', error);
      }
    };
    fetchGameState();
  }, [username]);

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>Your game dashboard is ready.</p>
      {/* Render game state or game logic components */}
    </div>
  );
};

export default GameDashboard;
