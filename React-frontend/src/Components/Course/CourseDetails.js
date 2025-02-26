import React from 'react';
import { Typography, Box } from '@mui/material';

const CourseDetails = ({ course }) => {
    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                Course Details
            </Typography>
            <Typography variant="body1" paragraph>
                {course.description}
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom>
                Lessons
            </Typography>
            <ul>
                {course.lessons.map((lesson, index) => (
                    <li key={index}>
                        <Typography variant="body1">{lesson.name}</Typography>
                    </li>
                ))}
            </ul>
        </Box>
    );
};

export default CourseDetails;