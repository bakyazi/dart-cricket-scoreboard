import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Switch,
    FormControlLabel,
    Button,
    IconButton,
    TextField,
    Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const SettingsPanel = ({ open, settings, onClose, onNewGame, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handlePlayerCountChange = (increment) => {
        const newCount = localSettings.playerCount + increment;
        if (newCount >= 2 && newCount <= 4) {
            setLocalSettings({
                ...localSettings,
                playerCount: newCount
            });
        }
    };

    // Separate save handler for theme changes
    const handleThemeChange = (isDarkMode) => {
        const newSettings = {
            ...settings,  // Use settings instead of localSettings to preserve current game state
            isDarkMode: isDarkMode
        };
        onSave(newSettings);
    };

    // Regular save handler for other settings
    const handleSave = () => {
        onSave(localSettings);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
        >
            <Box sx={{ width: 300, p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Settings
                </Typography>

                {/* New Game Button */}
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={onNewGame}
                    >
                        New Game
                    </Button>
                </Box>

                {/* Player Count Control */}
                <Box sx={{ my: 3 }}>
                    <Typography gutterBottom>Player Count</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton
                            onClick={() => handlePlayerCountChange(-1)}
                            disabled={localSettings.playerCount <= 2}
                        >
                            <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ minWidth: '30px', textAlign: 'center' }}>
                            {localSettings.playerCount}
                        </Typography>
                        <IconButton
                            onClick={() => handlePlayerCountChange(1)}
                            disabled={localSettings.playerCount >= 4}
                        >
                            <AddIcon />
                        </IconButton>
                    </Stack>
                </Box>

                {/* Player Names */}
                {Array.from({ length: localSettings.playerCount }).map((_, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label={`Player ${index + 1} Name`}
                            value={localSettings.players[index]}
                            onChange={(e) => {
                                const newPlayers = [...localSettings.players];
                                newPlayers[index] = e.target.value;
                                setLocalSettings({
                                    ...localSettings,
                                    players: newPlayers
                                });
                            }}
                        />
                    </Box>
                ))}

                {/* Optional Numbers Switch */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={localSettings.showOptionalNumbers}
                            onChange={(e) => setLocalSettings({
                                ...localSettings,
                                showOptionalNumbers: e.target.checked
                            })}
                        />
                    }
                    label="Show Optional Numbers (11-14)"
                />

                {/* Optional Letters Switch */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={localSettings.showOptionalLetters}
                            onChange={(e) => setLocalSettings({
                                ...localSettings,
                                showOptionalLetters: e.target.checked
                            })}
                        />
                    }
                    label="Show Optional Letters (D,T,H)"
                />

                {/* Dark Mode Switch - Direct theme change */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    my: 2,
                    px: 1
                }}>
                    <Typography>Theme</Typography>
                    <IconButton
                        onClick={() => handleThemeChange(!settings.isDarkMode)}
                        sx={{
                            color: settings.isDarkMode ? 'white' : '#044b20',
                            '&:hover': {
                                backgroundColor: settings.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(4, 75, 32, 0.08)'
                            }
                        }}
                    >
                        {settings.isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
                    </IconButton>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        fullWidth
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        fullWidth
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default SettingsPanel; 