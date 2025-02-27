import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../Contexts/User';
import { Container, Typography, Box, Button, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const IntroductoryQuiz = () => {
    const { courseId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/courses/${courseId}/introductory-quiz`);
                console.log('Fetched quiz data:', response.data); // Debug log
                setQuiz(response.data);
                // Initialize answers object
                const initialAnswers = {};
                response.data.questions.forEach(question => {
                    initialAnswers[question.id] = '';
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error('Error fetching quiz:', error);
            }
        };

        fetchQuiz();
    }, [courseId]);

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
        const unansweredQuestions = quiz.questions.filter(question => answers[question.id] === '');
        if (unansweredQuestions.length > 0) {
            alert('Please answer all questions before submitting.');
            return;
        }

        try {
            // Validate and format question summaries
            const questionSummaries = quiz.questions.map(question => {
                const selectedOptionIndex = parseInt(answers[question.id], 10);
                const selectedOption = question.options[selectedOptionIndex];
                
                // Debug logging
                console.log('Selected option:', selectedOption);
                console.log('Correct flag:', selectedOption.correct); // Note: using 'correct' instead of 'isCorrect'

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
                    correct: selectedOption.correct // Changed from isCorrect to correct
                };
            });

            const payload = {
                userId: user.id,
                questionSummaries: questionSummaries
            };

            console.log('Final quiz submission payload:', JSON.stringify(payload, null, 2));

            const response = await axios.post(
                `http://localhost:8080/users/${user.id}/courses/${courseId}/intro-quiz`, 
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201 || response.status === 200) {
                console.log('Quiz submission successful:', response.data);
                const summaryId = response.data.id;
                navigate(`/quiz-summary?type=introductory&courseId=${courseId}&summaryId=${summaryId}`);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert(`Failed to submit quiz: ${error.message}`);
        }
    };

    if (!quiz) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {quiz.name}
                </Typography>
                <Typography variant="body1" gutterBottom color="textSecondary">
                    Please answer all questions to proceed with the course.
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

export default IntroductoryQuiz;