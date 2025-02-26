import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../Contexts/User';
import { Button, Typography, Box, Container, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import YouTube from 'react-youtube';

// YouTube video options
const youtubeOpts = {
    height: '390',
    width: '640',
    playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0, // Don't show related videos
        modestbranding: 1, // Hide YouTube logo
        origin: window.location.origin // Add origin for security
    }
};

// Extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
};

// Add this function after getYouTubeVideoId
const isFinalQuizEnabled = (course, completedLessons) => {
    return course.lessons.every(lesson => 
        completedLessons.some(completed => completed.id === lesson.id)
    );
};

const Learn = () => {
    const { courseId, lessonId } = useParams();
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            setError(null);
            try {
                // Check if user has completed intro quiz
                const introQuizResponse = await axios.get(
                    `http://localhost:8080/users/${user.id}/courses/${courseId}/intro-quiz-summaries`
                );

                if (!introQuizResponse.data || introQuizResponse.data.length === 0) {
                    navigate(`/courses/${courseId}/introductory-quiz`);
                    return;
                }

                try {
                    // Split the Promise.all to handle completed lessons separately
                    const [courseResponse, lessonResponse] = await Promise.all([
                        axios.get(`http://localhost:8080/courses/${courseId}`),
                        axios.get(`http://localhost:8080/courses/${courseId}/lessons/${lessonId}`)
                    ]);

                    setCourse(courseResponse.data);
                    setLesson(lessonResponse.data);

                    // Handle completed lessons separately with error fallback
                    try {
                        const completedLessonsResponse = await axios.get(
                            `http://localhost:8080/courses/${courseId}/users/${user.id}/completed-lessons`
                        );
                        setCompletedLessons(completedLessonsResponse.data || []);
                    } catch (completedError) {
                        console.warn('Error fetching completed lessons:', completedError);
                        setCompletedLessons([]); // Set empty array as fallback
                    }

                } catch (dataError) {
                    console.error('Error fetching course/lesson data:', dataError);
                    setError('Failed to load course content. Please try again.');
                }

            } catch (introQuizError) {
                console.error('Error checking intro quiz:', introQuizError);
                navigate(`/courses/${courseId}/introductory-quiz`);
            } finally {
                setLoading(false);
            }
        };

        if (user && courseId && lessonId) {
            fetchCourse();
        }
    }, [courseId, lessonId, user, navigate]);

    const handleQuiz = async () => {
        try {
            // Check if quiz already completed
            const quizStatusResponse = await axios.get(
                `http://localhost:8080/courses/${courseId}/lessons/${lessonId}/users/${user.id}/quiz-status`
            );

            if (quizStatusResponse.data && quizStatusResponse.data.completed) {
                // Quiz already completed
                const currentLessonIndex = course.lessons.findIndex(l => l.id === parseInt(lessonId));
                const nextLesson = course.lessons[currentLessonIndex + 1];
                
                if (nextLesson) {
                    navigate(`/learn/${courseId}/${nextLesson.id}`);
                } else {
                    // No more lessons, check if final quiz is available
                    const finalQuizResponse = await axios.get(
                        `http://localhost:8080/courses/${courseId}/final-quiz`
                    );
                    if (finalQuizResponse.data) {
                        navigate(`/courses/${courseId}/final-quiz`);
                    } else {
                        navigate(`/courses/${courseId}`);
                    }
                }
            } else {
                // Quiz not completed, navigate to lesson quiz
                navigate(`/courses/${courseId}/lessons/${lessonId}/quiz`);
            }
        } catch (error) {
            console.error('Error checking quiz status:', error);
            navigate(`/courses/${courseId}/lessons/${lessonId}/quiz`);
        }
    };

    const handleLessonClick = (clickedLessonId) => {
        if (!course?.lessons) return;

        const lessonIndex = course.lessons.findIndex(l => l.id === clickedLessonId);
        
        // If completedLessons is empty (due to API error), allow clicking any lesson
        if (completedLessons.length === 0) {
            navigate(`/learn/${courseId}/${clickedLessonId}`);
            return;
        }

        const previousLessonsCompleted = course.lessons
            .slice(0, lessonIndex)
            .every(l => completedLessons.some(cl => cl.id === l.id));

        if (completedLessons.some(cl => cl.id === clickedLessonId) || previousLessonsCompleted) {
            navigate(`/learn/${courseId}/${clickedLessonId}`);
        } else {
            alert('Please complete previous lessons first');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container>
            <Typography variant="h4" component="h1" mt={4}>
                {course.name}
            </Typography>
            <Box display="flex" mt={4}>
                <Box flex={1}>
                    {lesson.youtubeVideoLink && !videoError && (
                        <Box mb={3}>
                            <YouTube 
                                videoId={getYouTubeVideoId(lesson.youtubeVideoLink)} 
                                opts={youtubeOpts}
                                onError={(error) => {
                                    setVideoError(true);
                                    console.error('YouTube Error:', error);
                                }}
                            />
                        </Box>
                    )}
                    {videoError && (
                        <Box mb={3}>
                            <Typography color="error">
                                Failed to load video. Please check your internet connection.
                            </Typography>
                        </Box>
                    )}
                    <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={handleQuiz}>
                            Attend Quiz
                        </Button>
                    </Box>
                    <Typography variant="h6" component="h2" mt={2}>
                        {lesson.name}
                    </Typography>
                    <Typography variant="body1" component="p" mt={2}>
                        {lesson.description}
                    </Typography>
                </Box>
                <Box ml={4} width="300px">
                    <Typography variant="h6" component="h2">
                        Lessons
                    </Typography>
                    <List>
                        {course.lessons.map((l) => (
                            <ListItem
                                key={l.id}
                                onClick={() => handleLessonClick(l.id)}
                                sx={{  // Using sx prop instead of style
                                    backgroundColor: completedLessons.some(cl => cl.id === l.id) 
                                        ? '#d3ffd3' 
                                        : '#ffd3d3',
                                    cursor: 'pointer', // Add pointer cursor
                                    '&:hover': {
                                        opacity: 0.9
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    {completedLessons.some(cl => cl.id === l.id) ? (
                                        <CheckCircleIcon color="primary" />
                                    ) : (
                                        <RadioButtonUncheckedIcon color="secondary" />
                                    )}
                                </ListItemIcon>
                                <ListItemText primary={l.name} />
                            </ListItem>
                        ))}
                        {/* Final Quiz List Item */}
                        <ListItem
                            onClick={() => {
                                if (isFinalQuizEnabled(course, completedLessons)) {
                                    navigate(`/courses/${courseId}/final-quiz`);
                                } else {
                                    alert('Please complete all lessons before attempting the final quiz');
                                }
                            }}
                            sx={{
                                backgroundColor: '#f0f0f0',
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.9
                                },
                                marginTop: 1,
                                borderTop: '2px solid #ddd'
                            }}
                        >
                            <ListItemIcon>
                                <RadioButtonUncheckedIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Final Quiz"
                                secondary={isFinalQuizEnabled(course, completedLessons) ? 
                                    "Ready to take" : 
                                    "Complete all lessons first"} 
                            />
                        </ListItem>
                    </List>
                </Box>
            </Box>
        </Container>
    );
};

export default Learn;