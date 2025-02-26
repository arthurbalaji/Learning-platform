import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../Contexts/User';
import { 
    Container, 
    Typography, 
    Box, 
    Button, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    Paper,
    CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const QuizSummary = () => {
    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const quizType = queryParams.get('type');
    const courseId = queryParams.get('courseId');
    const quizSummaryId = queryParams.get('summaryId');
    const lessonId = queryParams.get('lessonId');
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSummary = async () => {
            console.log('QuizSummary - Received quizSummaryId:', quizSummaryId); // Debug log
            
            
            
            try {
                setLoading(true);
                setError(null);
                
                const parsedCourseId = parseInt(courseId);
                const parsedQuizSummaryId = parseInt(quizSummaryId);
                console.log('Fetching quiz summary for course ID:', parsedCourseId, 'and quizSummaryId:', parsedQuizSummaryId); // Debug log
                
                let response;
                if (quizType === 'introductory') {
                    response = await axios.get(
                        `http://localhost:8080/users/${user.id}/courses/${parsedCourseId}/intro-quiz-summary/${parsedQuizSummaryId}`
                    );
                } else if (quizType === 'final') {
                    response = await axios.get(
                        `http://localhost:8080/users/${user.id}/courses/${parsedCourseId}/final-quiz-summary/${parsedQuizSummaryId}`
                    );
                } else {
                    response = await axios.get(
                        `http://localhost:8080/users/${user.id}/courses/${parsedCourseId}/lessons/${lessonId}/quiz-summary/${parsedQuizSummaryId}`
                    );
                }
                
                console.log('Quiz summary response:', response.data); // Debug log
                
                if (response.data) {
                    setSummary(response.data);
                } else {
                    throw new Error('No quiz summary data received');
                }
            } catch (error) {
                console.error('Error fetching quiz summary:', error);
                const errorMessage = error.response?.data?.message || 
                                   (typeof error.response?.data === 'string' ? error.response.data : null) || 
                                   error.message || 
                                   'Failed to load quiz summary';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [courseId, quizSummaryId, user, quizType, lessonId]);

    const getNextLessonId = () => {
        if (!summary?.quiz?.course?.lessons) return null;
        const course = summary.quiz.course;
        
        // For lesson quiz, find next lesson
        if (lessonId) {
            const currentLessonIndex = course.lessons.findIndex(
                lesson => lesson.id === parseInt(lessonId)
            );
            if (currentLessonIndex !== -1 && currentLessonIndex < course.lessons.length - 1) {
                return course.lessons[currentLessonIndex + 1].id;
            }
            // Only return null if we're at the last lesson
            return null;
        }
        
        // For introductory quiz, return the first lesson's ID
        if (quizType === 'introductory') {
            return course.lessons[0]?.id || null;
        }
        
        return null;
    };

    const handleContinue = async () => {
        try {
            const score = calculateScore();
            
            if (!summary?.quiz) {
                throw new Error('Quiz data is not available');
            }
            
            if (quizType === 'final' && score >= 80) {
                // Mark course as completed
                await axios.post(
                    `http://localhost:8080/users/${user.id}/courses/${courseId}/complete`
                );
                navigate('/dashboard', { 
                    state: { 
                        message: 'Congratulations! You have completed the course.' 
                    } 
                });
            } else if (quizType === 'final' && score < 80) {
                // Allow retrying the final quiz
                navigate(`/courses/${courseId}`);
            } else if (quizType === 'introductory') {
                // Navigate to first lesson
                if (!summary.quiz.course?.lessons?.length) {
                    navigate(`/courses/${courseId}`);
                    return;
                }
                
                const firstLessonId = summary.quiz.course.lessons[0].id;
                navigate(`/learn/${courseId}/${firstLessonId}`);
            } else {
                // For lesson quizzes
                if (score >= 80) {
                    const nextLessonId = getNextLessonId();
                    if (nextLessonId) {
                        // Navigate to the next lesson using the learn page
                        navigate(`/learn/${courseId}/${nextLessonId}`);
                    } else {
                        // Check if we can access final quiz
                        if (!summary.quiz.course?.lessons) {
                            navigate(`/courses/${courseId}`);
                            return;
                        }
                        
                        const allLessonsCompleted = summary.quiz.course.lessons.every(lesson =>
                            summary.quiz.course.completedLessons?.some(cl => cl.id === lesson.id)
                        );
                        
                        if (allLessonsCompleted) {
                            navigate(`/courses/${courseId}/final-quiz`);
                        } else {
                            navigate(`/courses/${courseId}`);
                        }
                    }
                } else {
                    // If score is less than 80%, stay on current lesson
                    navigate(`/learn/${courseId}/${lessonId}`);
                }
            }
        } catch (error) {
            console.error('Error handling navigation:', error);
            setError(error.message || 'Failed to process quiz completion');
            // Fallback navigation to course page on error
            navigate(`/courses/${courseId}`);
        }
    };

    const calculateScore = () => {
        if (!summary?.questionSummaries?.length) return 0;
        const correctAnswers = summary.questionSummaries.filter(qs => qs.correct).length;
        return Math.round((correctAnswers / summary.questionSummaries.length) * 100);
    };

    const getPassingScore = () => {
        switch(quizType) {
            case 'final':
                return 80;
            case 'lesson':
                return 80;
            default: // introductory
                return 60;
        }
    };

    // Show loading state
    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    // Show error state
    if (error || !summary) {
        return (
            <Container>
                <Box mt={4} textAlign="center">
                    <Typography variant="h6" color="error" gutterBottom>
                        {typeof error === 'string' ? error : 'Failed to load quiz summary'}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => navigate(-1)}
                        sx={{ mt: 2 }}
                    >
                        Go Back
                    </Button>
                </Box>
            </Container>
        );
    }

    const score = calculateScore();
    const passed = score >= getPassingScore();

    return (
        <Container maxWidth="md">
            <Box mt={4} mb={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Quiz Results
                    </Typography>

                    <Box mt={4} textAlign="center">
                        <Typography variant="h1" 
                            color={passed ? 'success.main' : 'error.main'}
                            sx={{ mb: 2 }}
                        >
                            {score}%
                        </Typography>
                        <Typography variant="h5" 
                            color={passed ? 'success.main' : 'error.main'}
                            sx={{ mb: 3 }}
                        >
                            {passed ? 'Congratulations! You Passed!' : 'Please Try Again'}
                        </Typography>
                    </Box>

                    <List sx={{ mt: 4 }}>
                        {summary.questionSummaries.map((qs, index) => (
                            <ListItem key={index} sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <ListItemIcon>
                                    {qs.correct ? 
                                        <CheckCircleIcon color="success" /> : 
                                        <CancelIcon color="error" />
                                    }
                                </ListItemIcon>
                                <ListItemText
                                    primary={qs.question.name}
                                    secondary={
                                        <>
                                            <Typography component="span" color="textSecondary">
                                                Your answer: {qs.question.options[qs.selectedOptionIndex]?.text}
                                            </Typography>
                                            {!qs.correct && (
                                                <Typography component="span" color="error" sx={{ display: 'block' }}>
                                                    Correct answer: {qs.question.options.find(opt => opt.correct)?.text}
                                                </Typography>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>

                    <Box mt={4} textAlign="center" display="flex" justifyContent="center" gap={2}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={() => navigate(`/courses/${courseId}`)}
                        >
                            Return to Course
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleContinue}
                        >
                            {passed ? 
                                (quizType === 'final' ? 'View Certificate' : 'Continue to Next Lesson') : 
                                'Try Again'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default QuizSummary;