import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';
import './GameStyles.css'; // Link to the CSS file
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

const GameDashboard = () => {
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [bingoCard, setBingoCard] = useState(null);
    const [availableGames, setAvailableGames] = useState([]);
    const [isCardSelected, setIsCardSelected] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [vantaEffect, setVantaEffect] = useState(null);
    const [joiningGame, setJoiningGame] = useState(false); // Track game join status
    const [joinCountdown, setJoinCountdown] = useState(5); // Countdown state
    const vantaRef = useRef(null);
    const bingoCardRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(
                FOG({
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    highlightColor: 0xB5FFE9,
                    lowlightColor: 0x8BE8CB,
                    baseColor: 0x50B2C0,
                    blurFactor: 0.90,
                    speed: 2.80,
                    zoom: 0.88
                })
            );
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    // Fetch available games from the backend
    useEffect(() => {
        const fetchAvailableGames = async () => {
            try {
                const token = localStorage.getItem('token'); // Adjust this line based on where your token is stored
                const response = await axios.get('/game/availableGames', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Available Games:", response.data.games);
                setAvailableGames(response.data.games);
            } catch (error) {
                console.error('Error fetching available games:', error);
            }
        };

        fetchAvailableGames();
    }, []);
    
    // Pagination logic
    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage === 2 ? 1 : prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => prevPage === 1 ? 2 : prevPage - 1);
    };

    const numbersToDisplay = currentPage === 1 ? Array.from({ length: 100 }, (_, i) => i + 1) : Array.from({ length: 100 }, (_, i) => i + 101);

    // Handle selecting a number from the grid
    const handleNumberClick = async (number) => {
        setSelectedNumber(number);
        try {
            console.log(`Fetching card for number: ${number}`); // Debugging log
            // Dynamic fetching of the Bingo card using selected number
            const token = localStorage.getItem('token'); // Retrieve token from localStorage
            const response = await axios.get(`/game/cards/${number}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Response:', response); // Debugging log
            const cardData = response.data.card;
            console.log("Card Data:", cardData); 
            setBingoCard(cardData);

            // Scroll to the bingo card on mobile view
            if (window.innerWidth <= 600) {
                bingoCardRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error(`Error fetching bingo card for number ${number}:`, error);
        }
    };

    // Confirm card selection
    const handleCardSelect = async () => {
        if (selectedNumber) {
            try {
                // Send selected card to the backend
                const token = localStorage.getItem('token'); // Retrieve token from localStorage
                await axios.post('/game/select-card', { cardId: selectedNumber }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setIsCardSelected(true);
                navigate('/game', { state: { bingoCard } }); // Redirect to GamePage with bingoCard data
            } catch (error) {
                console.error('Error selecting card:', error);
            }
        } else {
            alert('Please select a number from the grid first!');
        }
    };

    // Join a game
    const joinGame = async (gameId) => {
        try {
            setJoiningGame(true); // Set status to joining
            const token = localStorage.getItem('token'); // Retrieve token from localStorage
            await axios.post(`/game/join/${gameId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Joined the game successfully!');
            
            // Countdown logic before prompting for card selection
            const countdown = setInterval(() => {
                setJoinCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(countdown);
                        setJoiningGame(false); // End joining status
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            console.error('Error joining game:', error);
        }
    };

    return (
        <div>
        {joiningGame ? (
            <div className="joining-status">
                <h2>Joining game... Countdown: {joinCountdown}</h2>
            </div>
        ) : (
            <div ref={vantaRef} className="game-dashboard-container">  
            <div className="left-container">
                <h1 className="welcome-text">Welcome to the Bingo Game!</h1>
                {!isCardSelected ? (
                    <div className="container">
                        <h2>Select a Number to Get Your Bingo Card</h2>
                        <div className="number-grid">
                            {numbersToDisplay.map((number) => (
                                <div
                                    key={number}
                                    className={`number-grid-item ${selectedNumber === number ? 'selected' : ''}`}
                                    onClick={() => handleNumberClick(number)}
                                >
                                    {number}
                                </div>
                            ))}
                        </div>
                        <div className="pagination-buttons">
                            <button onClick={handlePrevPage} disabled={currentPage === 1}>
                                Previous
                            </button>
                            <button onClick={handleNextPage} disabled={currentPage === 2}>
                                Next
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="right-container" ref={bingoCardRef}>
                {selectedNumber && (
                    <div className="bingo-card-container">
                        <h3>Your Bingo Card (Card #{selectedNumber})</h3>
                        <div className="bingo-card">
                            <div className="bingo-header">
                                {BINGO_LETTERS.map((letter, index) => (
                                    <div key={index} className={`bingo-header-cell ${letter}`}>
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <div className="bingo-body">
                                {bingoCard &&
                                    bingoCard.map((row, rowIndex) => (
                                        <div key={rowIndex} className="bingo-row">
                                            {row.map((cell, cellIndex) => (
                                                <div key={cellIndex} className="bingo-cell">
                                                    {cell === '★' ? '★' : cell}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <button onClick={handleCardSelect} className="select-card-button">
                            Confirm Card
                        </button>
                    </div>
                )}
            </div>

            <div className="available-games-container">
                <h2>Available Games</h2>
                <ul>
                    {availableGames.map((game) => (
                        <li key={game.id}>
                            {game.name} - {game.status}
                            <button onClick={() => joinGame(game.id)}>Join Game</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        )}
    </div>
        
    );
};

export default GameDashboard;