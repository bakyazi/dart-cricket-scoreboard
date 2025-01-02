import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CricketScoreboard from './components/CricketScoreboard';
import SettingsPanel from './components/SettingsPanel';
import './App.css';
import { Box, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

// Move theme creation to a function to handle dynamic changes
const createAppTheme = (isDarkMode) => createTheme({
    palette: {
        mode: isDarkMode ? 'dark' : 'light',
        primary: {
            main: '#044b20',
        },
        secondary: {
            main: isDarkMode ? '#ffffff' : '#044b20',
        },
        background: {
            default: isDarkMode ? '#044b20' : '#ffffff',
            paper: isDarkMode ? '#121212' : '#f5f5f5',
        },
        text: {
            primary: isDarkMode ? '#ffffff' : '#044b20',
            secondary: isDarkMode ? '#ffffff' : '#044b20',
        },
        cricket: {
            boardBackground: isDarkMode ? '#044b20' : '#ffffff',
            textColor: isDarkMode ? '#ffffff' : '#044b20',
            borderColor: isDarkMode ? '#ffffff' : '#044b20',
        },
        action: {
            disabled: isDarkMode ? '#ffffff40' : undefined,
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                outlined: {
                    borderColor: isDarkMode ? '#ffffff' : '#044b20',
                    color: isDarkMode ? '#ffffff' : '#044b20',
                    '&:hover': {
                        borderColor: isDarkMode ? '#ffffff' : '#044b20',
                    }
                }
            }
        }
    }
});

const STORAGE_SETTINGS = 'cricket_settings';
const STORAGE_GAME_STATE = 'cricket_game_state';

function App() {
    useEffect(() => {
        document.title = 'Dart Cricket Scoreboard';
    }, []);

    // Add isDarkMode to default settings
    const defaultSettings = {
        playerCount: 2,
        showOptionalNumbers: false,
        showOptionalLetters: false,
        players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
        isDarkMode: true,  // Default to dark mode
    };

    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem(STORAGE_SETTINGS);
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    });

    // Create theme based on current mode
    const theme = createAppTheme(settings.isDarkMode);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [gameKey, setGameKey] = useState(0);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }, [settings]);

    const handleNewGame = () => {
        setGameKey(prevKey => prevKey + 1);
        setSettingsOpen(false);
        try {
            localStorage.removeItem(STORAGE_GAME_STATE);
        } catch (error) {
            console.error('Error removing game state:', error);
        }
    };

    // Add this function to calculate width based on player count (same as in CricketScoreboard)
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

    return (
        <ThemeProvider theme={theme}>
            <div
                className="App"
                style={{
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    minHeight: '100vh'
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: getBoardWidth(),  // Dynamic width based on player count
                        margin: '0 auto',
                        padding: '8px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 'bold',
                            fontFamily: "'Permanent Marker', cursive",
                            fontSize: '2.5rem',
                            letterSpacing: '2px',
                            marginLeft: '8px'
                        }}
                    >
                        Cricket
                    </Typography>
                    <IconButton
                        onClick={() => setSettingsOpen(true)}
                        sx={{
                            color: theme.palette.text.primary,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <SettingsIcon />
                    </IconButton>
                </Box>
                <CricketScoreboard
                    key={gameKey}
                    settings={settings}
                />
                <SettingsPanel
                    open={settingsOpen}
                    settings={settings}
                    onClose={() => setSettingsOpen(false)}
                    onNewGame={handleNewGame}
                    onSave={(newSettings) => {
                        setSettings(newSettings);
                        setSettingsOpen(false);
                    }}
                />
            </div>
        </ThemeProvider>
    );
}

export default App; 