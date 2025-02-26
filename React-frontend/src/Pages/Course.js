import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../Contexts/User';
import { Button, LinearProgress, Typography, Box, Container, List, ListItem, ListItemText } from '@mui/material';

const Course = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/courses/${courseId}`);
                setCourse(response.data);
                
                if (user) {
                    const [enrolledResponse, completedResponse] = await Promise.all([
                        axios.get(`http://localhost:8080/users/${user.id}/enrolled-courses`),
                        axios.get(`http://localhost:8080/users/${user.id}/completed-courses`)
                    ]);

                    const enrolledCourses = enrolledResponse.data;
                    const isEnrolled = enrolledCourses.some(c => c.id === parseInt(courseId));
                    setEnrolled(isEnrolled);

                    const completedCourses = completedResponse.data;
                    const isCompleted = completedCourses.some(c => c.id === parseInt(courseId));
                    setCompleted(isCompleted);

                    if (isEnrolled) {
                        const quizStatusResponse = await axios.get(
                            `http://localhost:8080/users/${user.id}/courses/${courseId}/quiz-status`
                        );
                        setQuizCompleted(quizStatusResponse.data.completed);
                    }
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            }
        };

        fetchCourse();
    }, [courseId, user]);

    const handleEnroll = async () => {
        try {
            await axios.post(`http://localhost:8080/users/${user.id}/enroll/${courseId}`);
            setEnrolled(true);
        } catch (error) {
            console.error('Error enrolling in course:', error);
        }
    };

    const handleDownloadCertificate = () => {
        // Implement certificate download logic here
        console.log('Download certificate');
    };

    const handleStartCourse = async () => {
        try {
            if (!user || !course) {
                console.error('User or course data missing');
                return;
            }

            // Get the quiz completion status for this course
            const quizSummaryResponse = await axios.get(
                `http://localhost:8080/users/${user.id}/courses/${courseId}/intro-quiz-summaries`
            );

            // If no quiz summaries exist, navigate to intro quiz
            if (!quizSummaryResponse.data || quizSummaryResponse.data.length === 0) {
                navigate(`/courses/${courseId}/introductory-quiz`);
                return;
            }

            // If quiz summaries exist, navigate to learn page with first lesson
            if (course.lessons && course.lessons.length > 0) {
                navigate(`/learn/${courseId}/${course.lessons[0].id}`);
            } else {
                console.error('No lessons found in course');
                navigate(`/courses/${courseId}`);
            }

        } catch (error) {
            console.error('Error checking quiz status:', error);
            navigate(`/courses/${courseId}/introductory-quiz`);
        }
    };

    if (!course) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                <img src={course.imageUrl} alt={course.name} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                <Typography variant="h4" component="h1" mt={2}>
                    {course.name}
                </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
                <Box flex={1}>
                    <Typography variant="h6" component="h2" mt={4}>
                        Course Description
                    </Typography>
                    <Typography variant="body1" component="p" mt={2}>
                        {course.description}
                    </Typography>
                    <Typography variant="h6" component="h2" mt={4}>
                        Lessons
                    </Typography>
                    <List>
                        {course.lessons.map((lesson) => (
                            <ListItem key={lesson.id}>
                                <ListItemText primary={lesson.name} secondary={lesson.description} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box ml={4} width="200px">
                    {completed ? (
                        <Button variant="contained" color="primary" onClick={handleDownloadCertificate}>
                            Download Certificate
                        </Button>
                    ) : enrolled ? (
                        <Box>
                            <Typography variant="h6">Course Progress</Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                                <Box width="100%" mr={1}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={completionPercentage} 
                                        sx={{
                                            height: 10,
                                            borderRadius: 5
                                        }}
                                    />
                                </Box>
                                <Box minWidth={35}>
                                    <Typography variant="body2" color="textSecondary">
                                        {`${completionPercentage}%`}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                                {course.lessons.length} lessons total
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleStartCourse}
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                {quizCompleted ? 'Continue Learning' : 'Start Course'}
                            </Button>
                        </Box>
                    ) : (
                        <Button variant="contained" color="primary" onClick={handleEnroll}>
                            Enroll
                        </Button>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default Course;