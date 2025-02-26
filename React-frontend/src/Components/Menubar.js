import React, { useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, TextField, Box } from '@mui/material';
import { UserContext } from '../Contexts/User';

const Menubar = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.elements.search.value;
        navigate(`/search?query=${query}`);
    };

    const handleLogout = useCallback(async () => {
        try {
            // First clear the local storage
            localStorage.clear();
            
            // Then update the user context
            await Promise.resolve(setUser(null));
            
            // Finally navigate to login page
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 0);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }, [navigate, setUser]);

    return (
        <AppBar position="static" color="default">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/Homepage" style={{ textDecoration: 'none', color: 'inherit', margin: '0 10px' }}>Homepage</Link>
                    <Link to="/enrolled-courses" style={{ textDecoration: 'none', color: 'inherit', margin: '0 10px' }}>Enrolled Courses</Link>
                    <Link to="/certificates" style={{ textDecoration: 'none', color: 'inherit', margin: '0 10px' }}>Certificates</Link>
                    <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit', margin: '0 10px' }}>Profile</Link>
                </Typography>
                <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex' }}>
                    <TextField
                        name="search"
                        placeholder="Search..."
                        variant="outlined"
                        size="small"
                        sx={{ marginRight: 1 }}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Search
                    </Button>
                </Box>
                <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ marginLeft: 2 }}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Menubar;