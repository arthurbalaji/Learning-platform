import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../Contexts/User';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const Login = () => {
    const [mailId, setMailId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/users/login', null, {
                params: {
                    mailId,
                    password
                }
            });
            const user = response.data;
            if (user) {
                setUser(user);
                if (user.role === 'STUDENT') {
                    navigate('/Homepage');
                } else if (user.role === 'ADMIN') {
                    navigate('/ManageCourses');
                } else {
                    setError('Invalid username or password');
                }
            } else {
                setError('Invalid username or password');
            }
        } catch (error) {
            setError('Invalid username or password');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={8} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h4" component="h1" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={handleLogin} style={{ width: '100%' }}>
                    <TextField
                        label="Email"
                        type="email"
                        value={mailId}
                        onChange={(e) => setMailId(e.target.value)}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                        margin="normal"
                    />
                    {error && (
                        <Typography color="error" variant="body2" align="center">
                            {error}
                        </Typography>
                    )}
                    <Box mt={2} display="flex" justifyContent="space-between">
                        <Button type="submit" variant="contained" color="primary">
                            Login
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => navigate('/register')}>
                            Register
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default Login;