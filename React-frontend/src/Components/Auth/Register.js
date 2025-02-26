import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../Contexts/User';
import { Container, TextField, Button, Typography, Box, Select, MenuItem, Chip, InputLabel, FormControl } from '@mui/material';

const Register = () => {
    const [name, setName] = useState('');
    const [mailId, setMailId] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [interests, setInterests] = useState([]);
    const [interestInput, setInterestInput] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/users/register', {
                name,
                mailId,
                password,
                dob,
                role,
                interests
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const user = response.data;
            setUser(user);
            if (user.role === 'STUDENT') {
                navigate('/Homepage');
            } else if (user.role === 'ADMIN') {
                navigate('/ManageCourses');
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
        }
    };

    const handleInterestInput = (e) => {
        if (e.key === 'Enter' && interestInput) {
            e.preventDefault();
            setInterests([...interests, interestInput]);
            setInterestInput('');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={8} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h4" component="h1" gutterBottom>
                    Register
                </Typography>
                <form onSubmit={handleRegister} style={{ width: '100%' }}>
                    <TextField
                        label="Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                        margin="normal"
                    />
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
                    <TextField
                        label="Date of Birth"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <MenuItem value="STUDENT">Student</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Interests"
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={handleInterestInput}
                        fullWidth
                        margin="normal"
                    />
                    <Box mt={2}>
                        {interests.map((interest, index) => (
                            <Chip
                                key={index}
                                label={interest}
                                onDelete={() => setInterests(interests.filter((_, i) => i !== index))}
                                style={{ marginRight: '5px', marginBottom: '5px' }}
                            />
                        ))}
                    </Box>
                    {error && (
                        <Typography color="error" variant="body2" align="center">
                            {error}
                        </Typography>
                    )}
                    <Box mt={2} display="flex" justifyContent="space-between">
                        <Button type="submit" variant="contained" color="primary">
                            Register
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default Register;