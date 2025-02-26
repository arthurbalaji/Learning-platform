import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SearchResult from '../Components/Searchresult';
import { Container, Typography, Box } from '@mui/material';

const SearchPage = () => {
    const [courses, setCourses] = useState([]);
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('query');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:8080/courses');
                const filteredCourses = response.data.filter(course =>
                    course.name.toLowerCase().includes(query.toLowerCase())
                );
                setCourses(filteredCourses);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        if (query) {
            fetchCourses();
        }
    }, [query]);

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Search Results for "{query}"
                </Typography>
                <SearchResult courses={courses} />
            </Box>
        </Container>
    );
};

export default SearchPage;