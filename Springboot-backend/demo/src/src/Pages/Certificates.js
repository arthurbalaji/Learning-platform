import React, { useContext, useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { UserContext } from '../Contexts/User';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Certificates = () => {
    const { user } = useContext(UserContext);
    const [completedCourses, setCompletedCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompletedCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/users/${user.id}/completed-courses`);
                setCompletedCourses(response.data);
            } catch (error) {
                console.error('Error fetching completed courses:', error);
            }
        };

        if (user) {
            fetchCompletedCourses();
        }
    }, [user]);

    const handleCourseClick = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Completed Courses
                </Typography>
                <Typography variant="h6" component="h2" mt={2} mb={3}>
                    Your Certificates
                </Typography>
                
                {completedCourses.length === 0 ? (
                    <Typography variant="body1" color="textSecondary">
                        You haven't completed any courses yet.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {completedCourses.map((course) => (
                            <Grid item xs={12} sm={6} md={4} key={course.id}>
                                <Card>
                                    <CardActionArea onClick={() => handleCourseClick(course.id)}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {course.title}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Completed on: {new Date(course.completionDate).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default Certificates;