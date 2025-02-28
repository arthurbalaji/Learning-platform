import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PopupGame = ({ open, onClose }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                style: {
                    height: '80vh',
                }
            }}
        >
            <DialogTitle>
                Take a Break!
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ height: 'calc(100% - 20px)' }}>
                    <iframe 
                        src="https://www.crazygames.com/embed/parking-jam-dqq" 
                        style={{ width: '100%', height: '100%' }} 
                        frameBorder="0" 
                        allow="gamepad *;" 
                        title="Relaxation Game"
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PopupGame;