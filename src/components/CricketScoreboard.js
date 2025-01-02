import React, { useState, useEffect } from 'react';
import { Box, Modal, Typography } from '@mui/material';
import './CricketScoreboard.css';
import { useTheme } from '@mui/material/styles';

const STORAGE_GAME_STATE = 'cricket_game_state';

const CricketScoreboard = ({ settings, onGameStateChange }) => {
    const theme = useTheme();

    const cssVariables = {
        '--board-background': theme.palette.cricket.boardBackground,
        '--cell-background': theme.palette.cricket.cellBackground,
        '--text-color': theme.palette.cricket.textColor,
        '--border-color': theme.palette.cricket.borderColor,
        '--primary-color': theme.palette.primary.main,
    };

    const numbers = ['20', '19', '18', '17', '16', '15'];
    const optionalNumbers = ['14', '13', '12', '11'];
    const baseLetters = ['B'];
    const optionalLetters = ['D', 'T', 'H'];

    // Helper function to check if a number/letter is active
    const isActive = (value) => {
        if (numbers.includes(value)) return true;
        if (baseLetters.includes(value)) return true;
        if (optionalNumbers.includes(value) && settings.showOptionalNumbers) return true;
        if (optionalLetters.includes(value) && settings.showOptionalLetters) return true;
        return false;
    };

    // Get currently active numbers in correct order
    const activeNumbers = [...numbers];
    if (settings.showOptionalNumbers) {
        activeNumbers.push(...optionalNumbers);
    }
    // Add letters in specific order: D, T, B, H
    if (settings.showOptionalLetters) {
        activeNumbers.push('D', 'T');
    }
    activeNumbers.push('B');  // B is always shown
    if (settings.showOptionalLetters) {
        activeNumbers.push('H');
    }

    // Use all possible numbers for state initialization
    const allNumbers = [...numbers, ...optionalNumbers, ...optionalLetters, ...baseLetters];

    // Initialize marks state for all players and numbers
    const initializeMarks = () => {
        const initialMarks = {};
        for (let player = 0; player < 4; player++) {
            initialMarks[player] = {};
            allNumbers.forEach(number => {
                initialMarks[player][number] = 0;
            });
        }
        return initialMarks;
    };

    // Initialize marks state from localStorage or default
    const [marks, setMarks] = useState(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_GAME_STATE);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                // Verify if saved state is valid
                if (parsedState && typeof parsedState === 'object') {
                    return parsedState;
                }
            }
        } catch (error) {
            console.error('Error loading game state:', error);
        }
        return initializeMarks();
    });

    const [winner, setWinner] = useState(null);

    // Save game state when marks change
    useEffect(() => {
        if (marks) {  // Only save if marks exist
            try {
                localStorage.setItem(STORAGE_GAME_STATE, JSON.stringify(marks));
            } catch (error) {
                console.error('Error saving game state:', error);
            }
        }
    }, [marks]);  // Remove onGameStateChange dependency

    // Track previous settings to detect actual changes
    const [prevSettings, setPrevSettings] = useState(settings);

    // Reset only when settings actually change
    useEffect(() => {
        // Skip on first mount
        if (JSON.stringify(prevSettings) === JSON.stringify(settings)) {
            return;
        }

        setPrevSettings(settings);
        setMarks(initializeMarks());
        setWinner(null);
        try {
            localStorage.removeItem(STORAGE_GAME_STATE);
        } catch (error) {
            console.error('Error removing game state:', error);
        }
    }, [settings, prevSettings]);

    // Render mark based on count
    const renderMark = (count, isEnabled) => {
        if (!isEnabled) return '';
        switch (count) {
            case 0:
                return '';
            case 1:
                return '/';
            case 2:
                return 'X';
            case 3:
                return 'Ⓧ';
            default:
                return '';
        }
    };

    // Handle cell click
    const handleCellClick = (player, number) => {
        if (!isActive(number)) return;

        const newMarks = { ...marks };
        newMarks[player][number] = (newMarks[player][number] + 1) % 4;
        setMarks(newMarks);

        checkWinner(player, newMarks);
    };

    // Check if a player has won
    const checkWinner = (player, currentMarks) => {
        const playerMarks = currentMarks[player];
        // Only check active numbers for win condition
        const hasWon = allNumbers.filter(isActive).every(number => playerMarks[number] === 3);
        if (hasWon) {
            setWinner(settings.players[player]);
        }
    };

    // Reset game function
    const resetGame = () => {
        const initialMarks = initializeMarks();
        setMarks(initialMarks);
        setWinner(null);
        try {
            localStorage.removeItem(STORAGE_GAME_STATE);
        } catch (error) {
            console.error('Error removing game state:', error);
        }
    };

    // Get active players for display
    const activePlayers = settings.players.slice(0, settings.playerCount);

    // Function to get grid template based on player count
    const getGridTemplate = () => {
        switch (settings.playerCount) {
            case 2:
                return "120px 120px 120px"; // Player 1 | Targets | Player 2
            case 3:
                return "120px 120px 120px 120px"; // Player 3 | Player 1 | Targets | Player 2
            case 4:
                return "120px 120px 120px 120px 120px"; // Player 3 | Player 1 | Targets | Player 2 | Player 4
            default:
                return "120px 120px 120px";
        }
    };

    // Function to get ordered players based on player count
    const getOrderedPlayers = () => {
        switch (settings.playerCount) {
            case 2:
                return {
                    left: [settings.players[0]],
                    right: [settings.players[1]]
                };
            case 3:
                return {
                    left: [settings.players[2], settings.players[0]],
                    right: [settings.players[1]]
                };
            case 4:
                return {
                    left: [settings.players[2], settings.players[0]],
                    right: [settings.players[1], settings.players[3]]
                };
            default:
                return {
                    left: [settings.players[0]],
                    right: [settings.players[1]]
                };
        }
    };

    // Get ordered players
    const orderedPlayers = getOrderedPlayers();

    // Function to get container width based on player count
    const getBoardWidth = () => {
        const columnWidth = 120; // Width of each column
        switch (settings.playerCount) {
            case 2:
                return `${columnWidth * 3}px`; // 3 columns (Player 1, Targets, Player 2)
            case 3:
                return `${columnWidth * 4}px`; // 4 columns
            case 4:
                return `${columnWidth * 5}px`; // 5 columns
            default:
                return `${columnWidth * 3}px`;
        }
    };

    // Function to get column count based on player count
    const getColumnCount = () => {
        switch (settings.playerCount) {
            case 2:
                return 3;
            case 3:
                return 4;
            case 4:
                return 5;
            default:
                return 3;
        }
    };

    return (
        <Box className="scoreboard">
            <div
                className="cricket-board-container"
                style={{
                    "--board-width": getBoardWidth(),
                    "--column-count": getColumnCount()
                }}
            >
                <div
                    className="cricket-board"
                    style={{
                        ...cssVariables,
                        "--grid-template": getGridTemplate()
                    }}
                >
                    {/* Header row with player names */}
                    <div className="row">
                        {orderedPlayers.left.map((player, index) => (
                            <div key={`left-${index}`} className="player-name">{player}</div>
                        ))}
                        <div className="numbers-column">
                            <div className="player-name">Targets</div>
                        </div>
                        {orderedPlayers.right.map((player, index) => (
                            <div key={`right-${index}`} className="player-name">{player}</div>
                        ))}
                    </div>

                    {/* Number rows */}
                    {activeNumbers.map(number => (
                        <div key={number} className="row">
                            {/* Left side players */}
                            {orderedPlayers.left.map((_, index) => {
                                const playerIndex = settings.playerCount === 2 ? 0 :
                                    index === 0 ? 2 : 0; // For 3 and 4 players
                                return (
                                    <div
                                        key={`left-${index}`}
                                        className="marks-container clickable"
                                        onClick={() => handleCellClick(playerIndex, number)}
                                    >
                                        {renderMark(marks[playerIndex][number], true)}
                                    </div>
                                );
                            })}

                            {/* Numbers column */}
                            <div className="numbers-column">
                                <div className="number-cell">
                                    {number}
                                </div>
                            </div>

                            {/* Right side players */}
                            {orderedPlayers.right.map((_, index) => {
                                const playerIndex = settings.playerCount === 2 ? 1 :
                                    index === 0 ? 1 : 3; // For 3 and 4 players
                                return (
                                    <div
                                        key={`right-${index}`}
                                        className="marks-container clickable"
                                        onClick={() => handleCellClick(playerIndex, number)}
                                    >
                                        {renderMark(marks[playerIndex][number], true)}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Winner Modal */}
            <Modal
                open={winner !== null}
                onClose={resetGame}
                aria-labelledby="winner-modal"
            >
                <div>
                    <div className="modal-overlay" onClick={resetGame} />
                    <div className="winner-modal">
                        <Typography variant="h4" component="h2">
                            🎉 Congratulations! 🎉
                        </Typography>
                        <Typography variant="h5">
                            {winner} has won the game!
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <button
                                onClick={resetGame}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    backgroundColor: '#1B4D3E',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                Play Again
                            </button>
                        </Box>
                    </div>
                </div>
            </Modal>
        </Box>
    );
};

export default CricketScoreboard; 