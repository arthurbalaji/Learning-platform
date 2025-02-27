import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, TextField, Button, Typography, Box,
    Select, MenuItem, InputLabel, FormControl,
    FormControlLabel, Checkbox
} from '@mui/material';

const AdminCourse = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState({
        id: null,
        name: '',
        description: '',
        imageUrl: '',
        introductoryQuiz: { id: null, questions: [] },
        lessons: [],
        finalQuiz: { id: null, questions: [] }
    });

    useEffect(() => {
        if (courseId) {
            const fetchCourse = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/courses/${courseId}`);
                    const fetchedCourse = response.data;
                    
                    // Initialize quizzes with proper structure
                    if (!fetchedCourse.introductoryQuiz) {
                        fetchedCourse.introductoryQuiz = { id: null, questions: [] };
                    }
                    
                    if (!fetchedCourse.finalQuiz) {
                        fetchedCourse.finalQuiz = { id: null, questions: [] };
                    }
                    
                    if (!Array.isArray(fetchedCourse.lessons)) {
                        fetchedCourse.lessons = [];
                    }
                    
                    // Initialize lesson quizzes
                    fetchedCourse.lessons.forEach(lesson => {
                        if (!lesson.quiz) {
                            lesson.quiz = { id: null, questions: [] };
                        }
                        if (!Array.isArray(lesson.quiz.questions)) {
                            lesson.quiz.questions = [];
                        }
                        
                        // Ensure proper question structure
                        lesson.quiz.questions = lesson.quiz.questions.map(question => ({
                            ...question,
                            options: Array.isArray(question.options) ? question.options : []
                        }));
                    });
                    
                    setCourse(fetchedCourse);
                } catch (error) {
                    console.error('Error fetching course:', error);
                }
            };
            fetchCourse();
        }
    }, [courseId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourse({ ...course, [name]: value });
    };

    const handleQuizChange = (quizType, questionIndex, field, value, lessonIndex = null) => {
        const updatedCourse = { ...course };
        let targetQuiz;

        if (lessonIndex !== null) {
            if (!updatedCourse.lessons[lessonIndex].quiz) {
                updatedCourse.lessons[lessonIndex].quiz = { 
                    id: null,
                    questions: [],
                    name: `${updatedCourse.lessons[lessonIndex].name} - Quiz`
                };
            }
            targetQuiz = updatedCourse.lessons[lessonIndex].quiz;
        } else {
            targetQuiz = updatedCourse[quizType];
        }

        if (!targetQuiz.questions[questionIndex]) {
            targetQuiz.questions[questionIndex] = { 
                id: null,
                name: '',  // Changed from text to name
                options: []
            };
        }

        // Map 'text' field to 'name' for questions
        const fieldName = field === 'text' ? 'name' : field;
        targetQuiz.questions[questionIndex][fieldName] = value;

        setCourse(updatedCourse);
    };

    const handleOptionChange = (quizType, questionIndex, optionIndex, field, value, lessonIndex = null) => {
        const updatedCourse = { ...course };
        let targetQuiz;

        if (lessonIndex !== null) {
            if (!updatedCourse.lessons[lessonIndex].quiz) {
                updatedCourse.lessons[lessonIndex].quiz = { 
                    id: null,
                    questions: [],
                    name: `${updatedCourse.lessons[lessonIndex].name} - Quiz`
                };
            }
            targetQuiz = updatedCourse.lessons[lessonIndex].quiz;
        } else {
            targetQuiz = updatedCourse[quizType];
        }

        if (!targetQuiz.questions[questionIndex]) {
            targetQuiz.questions[questionIndex] = { 
                id: null,
                name: '', 
                options: []
            };
        }

        if (!targetQuiz.questions[questionIndex].options[optionIndex]) {
            targetQuiz.questions[questionIndex].options[optionIndex] = { 
                id: null,
                text: '', 
                correct: false
            };
        }

        // Set the correct field directly without mapping
        const fieldToUpdate = field === 'isCorrect' ? 'correct' : field;
        targetQuiz.questions[questionIndex].options[optionIndex][fieldToUpdate] = value;
        
        setCourse(updatedCourse);
    };

    const handleLessonChange = (index, field, value) => {
        const updatedLessons = [...course.lessons];
        updatedLessons[index][field] = value;
        setCourse({ ...course, lessons: updatedLessons });
    };

    const handleAddQuestion = (quizType, lessonIndex = null) => {
        const updatedCourse = { ...course };
        const newQuestion = { 
            id: null,
            name: '',  // Changed from text to name
            options: [{
                id: null,
                text: '',
                correct: false
            }]
        };
        
        let targetQuiz;
        if (lessonIndex !== null) {
            if (!updatedCourse.lessons[lessonIndex].quiz) {
                updatedCourse.lessons[lessonIndex].quiz = {
                    id: null,
                    name: `${updatedCourse.lessons[lessonIndex].name} - Quiz`,
                    questions: []
                };
            }
            targetQuiz = updatedCourse.lessons[lessonIndex].quiz;
        } else {
            targetQuiz = updatedCourse[quizType];
            if (!targetQuiz.name) {
                targetQuiz.name = `${quizType === 'introductoryQuiz' ? 'Introductory' : 'Final'} Quiz`;
            }
        }
        
        if (!targetQuiz.questions) {
            targetQuiz.questions = [];
        }
                
        targetQuiz.questions.push(newQuestion);
        setCourse(updatedCourse);
    };

    const handleAddOption = (quizType, questionIndex, lessonIndex = null) => {
        const updatedCourse = { ...course };
        const newOption = {
            id: null,
            text: '',
            correct: false
        };
        
        let targetQuiz;
        if (lessonIndex !== null) {
            if (!updatedCourse.lessons[lessonIndex].quiz) {
                updatedCourse.lessons[lessonIndex].quiz = { questions: [] };
            }
            targetQuiz = updatedCourse.lessons[lessonIndex].quiz;
        } else {
            targetQuiz = updatedCourse[quizType];
        }

        if (!targetQuiz.questions[questionIndex]) {
            targetQuiz.questions[questionIndex] = { name: '', options: [] };
        }

        targetQuiz.questions[questionIndex].options.push(newOption);
        setCourse(updatedCourse);
    };

    const handleAddLesson = () => {
        const newLesson = {
            id: null,
            name: '',
            description: '',
            youtubeVideoLink: '',
            difficultyLevel: 'EASY',
            quiz: {
                id: null,
                questions: [{
                    id: null,
                    name: '',  // Changed from text to name
                    options: [{
                        id: null,
                        text: '',
                        correct: false
                    }]
                }]
            }
        };
        
        setCourse(prevCourse => ({
            ...prevCourse,
            lessons: [...(Array.isArray(prevCourse.lessons) ? prevCourse.lessons : []), newLesson]
        }));
    };

    const prepareQuizData = (quiz) => {
        if (!quiz) return { questions: [] };
        
        return {
            ...quiz,
            questions: quiz.questions.map(question => ({
                ...question,
                name: question.name || question.text || '',  // Handle both name and text fields
                options: question.options.map(option => ({
                    ...option,
                    text: option.text || '',
                    correct: Boolean(option.correct),  // Ensure boolean value
                    id: option.id || null
                })),
                id: question.id || null
            })),
            id: quiz.id || null
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const preparedCourse = {
                ...course,
                introductoryQuiz: course.introductoryQuiz ? {
                    ...prepareQuizData(course.introductoryQuiz),
                    name: `${course.name} - Introductory Quiz`
                } : null,
                finalQuiz: course.finalQuiz ? {
                    ...prepareQuizData(course.finalQuiz),
                    name: `${course.name} - Final Quiz`
                } : null,
                lessons: course.lessons.map(lesson => ({
                    ...lesson,
                    quiz: lesson.quiz ? {
                        ...prepareQuizData(lesson.quiz),
                        name: `${lesson.name} - Quiz`
                    } : null
                }))
            };

            let response;
            if (courseId) {
                response = await axios.put(`http://localhost:8080/courses/${courseId}`, preparedCourse);
                alert('Course updated successfully!');
            } else {
                response = await axios.post('http://localhost:8080/courses/add', preparedCourse);
                alert('Course added successfully!');
            }
            navigate('/manage-courses');
        } catch (error) {
            console.error('Error saving course:', error);
            alert(error.response?.data?.message || 'Error saving course');
        }
    };

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4" component="h1">
                    {courseId ? 'Update Course' : 'Add New Course'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        name="name"
                        value={course.name}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={course.description}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Image URL"
                        name="imageUrl"
                        value={course.imageUrl}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <Typography variant="h6" component="h2" mt={4}>
                        Introductory Quiz
                    </Typography>
                    {course.introductoryQuiz.questions.map((question, qIndex) => (
                        <Box key={qIndex} mt={2}>
                            <TextField
                                label={`Question ${qIndex + 1}`}
                                value={question.name || ''}  // Changed from text to name
                                onChange={(e) => handleQuizChange('introductoryQuiz', qIndex, 'text', e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                            />
                            {question.options.map((option, oIndex) => (
                                <Box key={oIndex} display="flex" alignItems="center" mt={1}>
                                    <TextField
                                        label={`Option ${oIndex + 1}`}
                                        value={option.text}
                                        onChange={(e) => handleOptionChange('introductoryQuiz', qIndex, oIndex, 'text', e.target.value)}
                                        required
                                        fullWidth
                                        margin="normal"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={option.correct}
                                                onChange={(e) => handleOptionChange('introductoryQuiz', qIndex, oIndex, 'isCorrect', e.target.checked)}
                                            />
                                        }
                                        label="Correct"
                                    />
                                </Box>
                            ))}
                            <Button variant="outlined" onClick={() => handleAddOption('introductoryQuiz', qIndex)}>
                                Add Option
                            </Button>
                        </Box>
                    ))}
                    <Button variant="outlined" onClick={() => handleAddQuestion('introductoryQuiz')}>
                        Add Question
                    </Button>
                    <Typography variant="h6" component="h2" mt={4}>
                        Lessons
                    </Typography>
                    {Array.isArray(course.lessons) && course.lessons.map((lesson, lIndex) => (
                        <Box key={lIndex} mt={2}>
                            <TextField
                                label={`Lesson ${lIndex + 1} Name`}
                                value={lesson.name}
                                onChange={(e) => handleLessonChange(lIndex, 'name', e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label={`Lesson ${lIndex + 1} Description`}
                                value={lesson.description}
                                onChange={(e) => handleLessonChange(lIndex, 'description', e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label={`Lesson ${lIndex + 1} YouTube Video Link`}
                                value={lesson.youtubeVideoLink}
                                onChange={(e) => handleLessonChange(lIndex, 'youtubeVideoLink', e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Difficulty Level</InputLabel>
                                <Select
                                    value={lesson.difficultyLevel}
                                    onChange={(e) => handleLessonChange(lIndex, 'difficultyLevel', e.target.value)}
                                    required
                                >
                                    <MenuItem value="EASY">Easy</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HARD">Hard</MenuItem>
                                </Select>
                            </FormControl>
                            <Typography variant="h6" component="h3" mt={2}>
                                Lesson Quiz
                            </Typography>
                            {lesson.quiz && lesson.quiz.questions.map((question, qIndex) => (
                                <Box key={qIndex} mt={2}>
                                    <TextField
                                        label={`Question ${qIndex + 1}`}
                                        value={question.name || ''}  // Changed from text to name
                                        onChange={(e) => handleQuizChange('lessons', qIndex, 'text', e.target.value, lIndex)}
                                        required
                                        fullWidth
                                        margin="normal"
                                    />
                                    {question.options.map((option, oIndex) => (
                                        <Box key={oIndex} display="flex" alignItems="center" mt={1}>
                                            <TextField
                                                label={`Option ${oIndex + 1}`}
                                                value={option.text || ''}
                                                onChange={(e) => handleOptionChange('lessons', qIndex, oIndex, 'text', e.target.value, lIndex)}
                                                required
                                                fullWidth
                                                margin="normal"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={Boolean(option.correct)}
                                                        onChange={(e) => handleOptionChange('lessons', qIndex, oIndex, 'isCorrect', e.target.checked, lIndex)}
                                                    />
                                                }
                                                label="Correct"
                                            />
                                        </Box>
                                    ))}
                                    <Button variant="outlined" onClick={() => handleAddOption('lessons', qIndex, lIndex)}>
                                        Add Option
                                    </Button>
                                </Box>
                            ))}
                            <Button variant="outlined" onClick={() => handleAddQuestion('lessons', lIndex)}>
                                Add Question
                            </Button>
                        </Box>
                    ))}
                    <Button variant="outlined" onClick={handleAddLesson}>
                        Add Lesson
                    </Button>
                    <Typography variant="h6" component="h2" mt={4}>
                        Final Quiz
                    </Typography>
                    {course.finalQuiz.questions.map((question, qIndex) => (
                        <Box key={qIndex} mt={2}>
                            <TextField
                                label={`Question ${qIndex + 1}`}
                                value={question.name || ''}  // Changed from text to name
                                onChange={(e) => handleQuizChange('finalQuiz', qIndex, 'text', e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                            />
                            {question.options.map((option, oIndex) => (
                                <Box key={oIndex} display="flex" alignItems="center" mt={1}>
                                    <TextField
                                        label={`Option ${oIndex + 1}`}
                                        value={option.text}
                                        onChange={(e) => handleOptionChange('finalQuiz', qIndex, oIndex, 'text', e.target.value)}
                                        required
                                        fullWidth
                                        margin="normal"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={option.correct}
                                                onChange={(e) => handleOptionChange('finalQuiz', qIndex, oIndex, 'isCorrect', e.target.checked)}
                                            />
                                        }
                                        label="Correct"
                                    />
                                </Box>
                            ))}
                            <Button variant="outlined" onClick={() => handleAddOption('finalQuiz', qIndex)}>
                                Add Option
                            </Button>
                        </Box>
                    ))}
                    <Button variant="outlined" onClick={() => handleAddQuestion('finalQuiz')}>
                        Add Question
                    </Button>
                    <Box mt={4}>
                        <Button type="submit" variant="contained" color="primary">
                            {courseId ? 'Update Course' : 'Add Course'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default AdminCourse;