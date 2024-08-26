import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GameDashboard from './components/GameDashboard';
import GamePage from './components/GamePage'; // Replace with actual component names

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameDashboard />} />
        <Route path="/" element={<GamePage />} />
      </Routes>
    </Router>
  );
};

export default App;
