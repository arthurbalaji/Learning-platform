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

        // Check for unanswered questions
        const unansweredQuestions = quiz.questions.filter(
            question => answers[question.id] === undefined
        );
        if (unansweredQuestions.length > 0) {
            alert('Please answer all questions before submitting.');
            return;
        }

        try {
            // Submit quiz and get summary
            const questionSummaries = quiz.questions.map(question => ({
                question: {
                    id: question.id,
                    name: question.name
                },
                selectedOptionIndex: parseInt(answers[question.id], 10),
                correct: question.options[answers[question.id]].correct
            }));

            // First API call to submit quiz
            const quizResponse = await axios.post(
                `http://localhost:8080/users/${user.id}/courses/${courseId}/intro-quiz`,
                {
                    userId: user.id,
                    questionSummaries
                }
            );

            // Fix: Change 'response' to 'quizResponse'
            if (quizResponse.status === 201 || quizResponse.status === 200) {
                const summaryId = quizResponse.data.id;

                // Second API call to analyze quiz
                try {
                    const analysisResponse = await axios.post(
                        `http://localhost:5000/users/${user.id}/courses/${courseId}/analyze-intro-quiz/${summaryId}`,
                        {},
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (analysisResponse.data.status === 'success') {
                        console.log('Quiz analysis complete:', analysisResponse.data);
                        
                        // Show completion message with recommendations
                        alert(
                            `Quiz completed successfully!\n\n${analysisResponse.data.recommendation}\n\n` +
                            `Your score: ${analysisResponse.data.overall_score}%\n` +
                            `Lessons automatically completed: ${analysisResponse.data.lessons_completed.length}`
                        );
                    }
                } catch (analysisError) {
                    console.error('Error analyzing quiz:', analysisError);
                    // Continue to summary page even if analysis fails
                }

                // Navigate to summary page
                navigate(`/quiz-summary?type=introductory&courseId=${courseId}&summaryId=${summaryId}`);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert(`Failed to submit quiz: ${error.response?.data?.message || error.message}`);
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