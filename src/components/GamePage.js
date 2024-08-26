import React, { useState, useEffect } from 'react';
import styles from './GamePage.module.css';
const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

const GamePage = ({ bingoCard }) => {
    const [markedNumbers, setMarkedNumbers] = useState([bingoCard[2][2]]); // Automatically mark the center cell
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [timer, setTimer] = useState(null);
    const [currentCall, setCurrentCall] = useState('');
    const [countdown, setCountdown] = useState(5); // Countdown state

    // Toggle marking a number on the card
    const toggleMarkNumber = (rowIndex, cellIndex) => {
        const number = bingoCard[rowIndex][cellIndex];
        setMarkedNumbers(prev =>
            prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
        );
    };

    // Check if the player has won Bingo
    const checkBingo = () => {
        const isSubset = markedNumbers.every(number => calledNumbers.includes(number));
        if (!isSubset) {
            alert('Not Bingo yet! Keep going!');
            return;
        }

        const rows = bingoCard.some(row => row.every(number => markedNumbers.includes(number)));
        const cols = bingoCard[0].some((_, i) => bingoCard.every(row => markedNumbers.includes(row[i])));
        const diag1 = bingoCard.every((row, i) => markedNumbers.includes(row[i]));
        const diag2 = bingoCard.every((row, i) => markedNumbers.includes(row[4 - i]));

        if (rows || cols || diag1 || diag2) {
            alert('Bingo! You win!');
        } else {
            alert('Not Bingo yet! Keep going!');
        }
    };

    // Update calledNumbers when currentCall changes
    useEffect(() => {
        if (currentCall) {
            setCalledNumbers(prev => [...prev, currentCall]);
        }
    }, [currentCall]);

    // Countdown effect
    useEffect(() => {
        if (countdown > 0) {
            const countdownInterval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(countdownInterval);
        }
    }, [countdown]);

    // Cleanup timer on component unmount
    useEffect(() => {
        const startTimer = () => {
            const calledNumbersSet = new Set(calledNumbers);

            const interval = setInterval(() => {
                if (calledNumbersSet.size >= 75) {
                    clearInterval(interval);
                    return;
                }

                let call;
                let number;
                let letter;
                // Generate a unique call
                do {
                    letter = BINGO_LETTERS[Math.floor(Math.random() * BINGO_LETTERS.length)];
                    
                    switch (letter) {
                        case 'B': number = Math.floor(Math.random() * 15) + 1; break;
                        case 'I': number = Math.floor(Math.random() * 15) + 16; break;
                        case 'N': number = Math.floor(Math.random() * 15) + 31; break;
                        case 'G': number = Math.floor(Math.random() * 15) + 46; break;
                        case 'O': number = Math.floor(Math.random() * 15) + 61; break;
                        default: number = Math.floor(Math.random() * 75) + 1;
                    }

                    call = `${letter}${number}`;
                } while (calledNumbersSet.has(call));

                calledNumbersSet.add(call);
                setCurrentCall(call);
                setCountdown(5); // Reset countdown
            }, 5000);

            setTimer(interval);
        };

        startTimer();
        return () => {
            clearInterval(timer);
        };
    }, [calledNumbers, timer]);

    const getColorClass = (call) => {
        switch (call[0]) {
            case 'B': return styles.red;
            case 'I': return styles.yellow;
            case 'N': return styles.blue;
            case 'G': return styles.orange;
            case 'O': return styles.green;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.calledNumbersContainer}>
                <h3>Called Numbers</h3>
                <div className={styles.calledNumbers}>
                    {calledNumbers.length > 0 ? calledNumbers.slice(-5).map((call, index) => (
                        <div key={index} className={`${styles.calledNumber} ${getColorClass(call)} ${styles.fadeIn}`}>
                            {call}
                        </div>
                    )) : <div>No numbers called yet</div>}
                </div>
            </div>
            <div className={styles.currentCall}>
                <h3>Current Call</h3>
                {currentCall ? (
                    <div className={`${styles.calledNumber} ${getColorClass(currentCall)} ${styles.fadeIn}`}>
                        {currentCall}
                    </div>
                ) : (
                    <div>No current call</div>
                )}
                <div className={styles.countdown}>
                    Next call in: {countdown} seconds
                </div>
            </div>
            <h2>Game Started</h2>
            <div className={styles.bingoCard}>
                <div className={styles.bingoHeader}>
                    {BINGO_LETTERS.map((letter, index) => (
                        <div key={index} className={`${styles.bingoHeaderCell} ${getColorClass(letter + '1')}`}>
                            {letter}
                        </div>
                    ))}
                </div>
                <div className={styles.bingoBody}>
                    {bingoCard.map((row, rowIndex) => (
                        <div key={rowIndex} className={styles.bingoRow}>
                            {row.map((cell, cellIndex) => (
                                <div
                                    key={cellIndex}
                                    className={`${styles.bingoCell} ${markedNumbers.includes(cell) ? styles.marked : ''}`}
                                    onClick={() => toggleMarkNumber(rowIndex, cellIndex)}
                                >
                                    {cell}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={checkBingo} className={styles.checkBingoButton}>Check Bingo</button>
        </div>
    );
};

export default GamePage;