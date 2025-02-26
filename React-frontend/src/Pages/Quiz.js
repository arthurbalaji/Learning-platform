import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../Contexts/User';
import { 
    Container, 
    Typography, 
    Box, 
    Button, 
    RadioGroup, 
    FormControlLabel, 
    Radio,
    CircularProgress 
} from '@mui/material';

const Quiz = () => {
    const { courseId, lessonId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(
                    `http://localhost:8080/courses/lessons/${lessonId}/quiz`
                );
                
                if (!response.data) {
                    throw new Error('No quiz found for this lesson');
                }
                
                setQuiz(response.data);
                
                // Initialize answers object
                const initialAnswers = {};
                response.data.questions.forEach(question => {
                    initialAnswers[question.id] = '';
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error('Error fetching quiz:', error);
                setError(error.message);
                // Navigate back to lesson if quiz fetch fails
                navigate(`/learn/${courseId}/${lessonId}`);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && lessonId) {
            fetchQuiz();
        }
    }, [courseId, lessonId, navigate]);

    const handleAnswerChange = (questionId, optionIndex) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!quiz || !user) {
            alert('Quiz or user data is missing');
            return;
        }

        // Check if all questions are answered
        const unansweredQuestions = quiz.questions.filter(
            question => answers[question.id] === ''
        );
        
        if (unansweredQuestions.length > 0) {
            alert('Please answer all questions before submitting.');
            return;
        }

        try {
            // Format question summaries
            const questionSummaries = quiz.questions.map(question => {
                const selectedOptionIndex = parseInt(answers[question.id], 10);
                const selectedOption = question.options[selectedOptionIndex];

                if (!selectedOption) {
                    throw new Error(`Invalid option selected for question: ${question.name}`);
                }

                return {
                    question: {
                        id: question.id,
                        name: question.name
                    },
                    selectedOption: {
                        id: selectedOption.id,
                        text: selectedOption.text
                    },
                    selectedOptionIndex: selectedOptionIndex,
                    correct: selectedOption.correct
                };
            });

            const response = await axios.post(
                `http://localhost:8080/users/${user.id}/courses/${courseId}/lessons/${lessonId}/quiz`,
                questionSummaries // Send only the questionSummaries array as required by the API
            );

            if (response.status === 201 || response.status === 200) {
                navigate(`/quiz-summary?type=lesson&courseId=${courseId}&lessonId=${lessonId}&summaryId=${response.data.id}`
                );
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert(`Failed to submit quiz: ${error.message}`);
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

    if (!quiz) {
        return <Typography>No quiz found for this lesson.</Typography>;
    }

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {quiz.name}
                </Typography>
                <Typography variant="body1" gutterBottom color="textSecondary">
                    Complete all questions to proceed with the course.
                </Typography>
                <form onSubmit={handleSubmit}>
                    {quiz.questions.map((question, questionIndex) => (
                        <Box key={question.id} mt={4} mb={4} p={2} border={1} borderRadius={1} borderColor="divider">
                            <Typography variant="h6" component="h2" gutterBottom>
                                {`${questionIndex + 1}. ${question.name}`}
                            </Typography>
                            <RadioGroup
                                value={answers[question.id]}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            >
                                {question.options.map((option, optionIndex) => (
                                    <FormControlLabel
                                        key={optionIndex}
                                        value={optionIndex}
                                        control={<Radio />}
                                        label={option.text}
                                    />
                                ))}
                            </RadioGroup>
                        </Box>
                    ))}
                    <Box mt={4} mb={4} display="flex" justifyContent="center">
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            size="large"
                        >
                            Submit Quiz
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default Quiz;