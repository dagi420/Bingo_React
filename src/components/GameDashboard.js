import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';
import './GameStyles.css'; // Link to the CSS file
import GamePage from './GamePage'; // Assuming GamePage is in the same directory

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

const GameDashboard = () => {
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [bingoCard, setBingoCard] = useState(null);
    const [isCardSelected, setIsCardSelected] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [gameStarted, setGameStarted] = useState(false);
    const [vantaEffect, setVantaEffect] = useState(null);
    const vantaRef = useRef(null);
    const bingoCardRef = useRef(null);

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
                    highlightColor: 0xD81159,
                    lowlightColor: 0xFFFFFF,
                    baseColor: 0x6BF178,
                    blurFactor: 0.90,
                    speed: 2.80,
                    zoom: 0.40
                })
            );
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    // Pagination logic
    const handleNextPage = () => {
        setCurrentPage((prevPage) => (prevPage === 2 ? 1 : prevPage + 1));
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => (prevPage === 1 ? 2 : prevPage - 1));
    };

    const numbersToDisplay = currentPage === 1 ? Array.from({ length: 100 }, (_, i) => i + 1) : Array.from({ length: 100 }, (_, i) => i + 101);

    // Handle selecting a number from the grid
    const handleNumberClick = (number) => {
        setSelectedNumber(number);
        const generatedCard = generateBingoCard(number);
        setBingoCard(generatedCard);

        // Scroll to the bingo card on mobile view
        if (window.innerWidth <= 600) {
            bingoCardRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Confirm card selection
    const handleCardSelect = () => {
        if (selectedNumber) {
            setIsCardSelected(true);
        } else {
            alert('Please select a number from the grid first!');
        }
    };

    // Start the game
    const startGame = () => {
        if (isCardSelected) {
            setGameStarted(true);
        } else {
            alert('Please select a card first!');
        }
    };

    // Bingo card generation logic
    const generateBingoCard = (seed) => {
        const card = [];
        for (let i = 0; i < 5; i++) {
            const column = [];
            let min, max;

            switch (i) {
                case 0: min = 1; max = 15; break;   // B
                case 1: min = 16; max = 30; break;  // I
                case 2: min = 31; max = 45; break;  // N
                case 3: min = 46; max = 60; break;  // G
                case 4: min = 61; max = 75; break;  // O
                default: min = 1; max = 75;
            }

            for (let j = 0; j < 5; j++) {
                if (i === 2 && j === 2) {
                    column.push('★'); // Free space
                } else {
                    let num;
                    do {
                        seed++;
                        num = Math.floor(seededRandom(seed) * (max - min + 1)) + min;
                    } while (column.includes(num));
                    column.push(num);
                }
            }
            card.push(column);
        }

        // Transpose to get correct layout
        return card[0].map((_, i) => card.map(row => row[i]));
    };

    // Seeded random number generator
    const seededRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    if (gameStarted) {
        return <GamePage bingoCard={bingoCard} />;
    }

    return (
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
                                    className={`number-grid-item ${selectedNumber === number ? "selected" : ""}`}
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
                                                    {cell === "★" ? "★" : cell}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <button onClick={handleCardSelect} className="select-card-button">
                            Confirm Card
                        </button>
                        {isCardSelected && (
                            <button onClick={startGame} className="start-game-button">
                                Start Game
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameDashboard;   