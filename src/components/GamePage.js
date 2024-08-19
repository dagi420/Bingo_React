import React, { useState, useEffect } from 'react';
import './GamePage.css';

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

const GamePage = () => {
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [bingoCard, setBingoCard] = useState(null);
    const [markedNumbers, setMarkedNumbers] = useState([]);
    const [isCardSelected, setIsCardSelected] = useState(false);
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [timer, setTimer] = useState(null);
    const [currentCall, setCurrentCall] = useState('');
    const [bingo, setBingo] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Handle switching between pages for card selection
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
        setMarkedNumbers([]);
        setBingo(false);
        setIsCardSelected(false);
    };

    // Handle confirming the card selection
    const handleCardSelect = () => {
        if (selectedNumber) {
            setIsCardSelected(true);
            startTimer();
        } else {
            alert('Please select a number from the grid first!');
        }
    };

    // Toggle marking a number on the card
    const toggleMarkNumber = (rowIndex, cellIndex) => {
        const number = bingoCard[rowIndex][cellIndex];
        setMarkedNumbers(prev =>
            prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
        );
    };

    // Check if the player has won Bingo
    const checkBingo = () => {
        const rows = bingoCard.some(row => row.every(number => markedNumbers.includes(number)));
        const cols = bingoCard[0].some((_, i) => bingoCard.every(row => markedNumbers.includes(row[i])));
        const diag1 = bingoCard.every((row, i) => markedNumbers.includes(row[i]));
        const diag2 = bingoCard.every((row, i) => markedNumbers.includes(row[4 - i]));

        if (rows || cols || diag1 || diag2) {
            setBingo(true);
            alert('Bingo! You win!');
        } else {
            alert('Not Bingo yet! Keep going!');
        }
    };

    // Start the timer to call out Bingo numbers
    const startTimer = () => {
        const calledNumbersSet = new Set(calledNumbers); // Use a Set to track called numbers
        const maxNumber = 75; // Maximum number in the Bingo card
    
        const interval = setInterval(() => {
            let call;
            let number;
            let letter;
    
            // Generate a unique call
            do {
                letter = BINGO_LETTERS[Math.floor(Math.random() * BINGO_LETTERS.length)];
                
                switch (letter) {
                    case 'B':
                        number = Math.floor(Math.random() * 15) + 1; // 1-15
                        break;
                    case 'I':
                        number = Math.floor(Math.random() * 15) + 16; // 16-30
                        break;
                    case 'N':
                        number = Math.floor(Math.random() * 15) + 31; // 31-45
                        break;
                    case 'G':
                        number = Math.floor(Math.random() * 15) + 46; // 46-60
                        break;
                    case 'O':
                        number = Math.floor(Math.random() * 15) + 61; // 61-75
                        break;
                    default:
                        number = Math.floor(Math.random() * maxNumber) + 1;
                }
    
                call = `${letter}${number}`;
            } while (calledNumbersSet.has(call) && calledNumbersSet.size < maxNumber); // Ensure it's unique and within range
    
            setCurrentCall(call);
            setCalledNumbers(prev => [...prev, call]);
            calledNumbersSet.add(call); // Update the Set with the new call
        }, 5000); // 5-second intervals
    
        setTimer(interval);
    };
    

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            clearInterval(timer);
        };
    }, [timer]);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
    };

    return (
        <div>
            {/* Dark mode toggle */}
            <button onClick={toggleDarkMode}>
                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
            {!isCardSelected ? (
                <div className="container">
                    <h2>Select a Number to Get Your Bingo Card</h2>
                    <div className="number-grid">
                        {numbersToDisplay.map(number => (
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
                        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                        <button onClick={handleNextPage} disabled={currentPage === 2}>Next</button>
                    </div>
                    {selectedNumber && (
                        <>
                            {/* Display the Bingo card when a number is selected */}
                            <div className="bingo-card-container">
                                <h3>Your Bingo Card (Card #{selectedNumber})</h3>
                                <div className="bingo-card">
                                    <div className="bingo-header">
                                        {BINGO_LETTERS.map((letter, index) => (
                                            <div key={index} className="bingo-header-cell">{letter}</div>
                                        ))}
                                    </div>
                                    <div className="bingo-body">
                                        {bingoCard && bingoCard.map((row, rowIndex) => (
                                            <div key={rowIndex} className="bingo-row">
                                                {row.map((cell, cellIndex) => (
                                                    <div
                                                        key={cellIndex}
                                                        className={`bingo-cell ${markedNumbers.includes(cell) ? 'marked' : ''}`}
                                                        onClick={() => toggleMarkNumber(rowIndex, cellIndex)}
                                                    >
                                                        {cell === '★' ? '★' : cell}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleCardSelect} className="select-card-button">
                                Start Game
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="container">
                    <h3>Game in progress</h3>
                    <p>Current Call: {currentCall}</p>
                    <div className="called-numbers">
                        <h4>Called Numbers History:</h4>
                        <div className="called-numbers-list">
                            {calledNumbers.map((call, index) => (
                                <span key={index} className="called-number">{call}</span>
                            ))}
                        </div>
                    </div>
                    <div className="bingo-card">
                        <div className="bingo-header">
                            {BINGO_LETTERS.map((letter, index) => (
                                <div key={index} className="bingo-header-cell">{letter}</div>
                            ))}
                        </div>
                        <div className="bingo-body">
                            {bingoCard.map((row, rowIndex) => (
                                <div key={rowIndex} className="bingo-row">
                                    {row.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            className={`bingo-cell ${markedNumbers.includes(cell) ? 'marked' : ''}`}
                                            onClick={() => toggleMarkNumber(rowIndex, cellIndex)}
                                        >
                                            {cell === '★' ? '★' : cell}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={checkBingo}>Check Bingo</button>
                </div>
            )}
        </div>
    );
};

// Bingo card generation logic
const generateBingoCard = (seed) => {
    const card = [];
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < 5; i++) {
        const column = [];
        let min, max;

        switch (i) {
            case 0: // B
                min = 1;
                max = 15;
                break;
            case 1: // I
                min = 16;
                max = 30;
                break;
            case 2: // N
                min = 31;
                max = 45;
                break;
            case 3: // G
                min = 46;
                max = 60;
                break;
            case 4: // O
                min = 61;
                max = 75;
                break;
            default:
                min = 1;
                max = 75;
        }

        for (let j = 0; j < 5; j++) {
            let num;
            do {
                num = random(min, max);
            } while (column.includes(num));
            column.push(num);
        }
        card.push(column);
    }

    card[2][2] = '★'; // Middle cell as a star
    return card[0].map((_, colIndex) => card.map(row => row[colIndex]));
};

export default GamePage;
