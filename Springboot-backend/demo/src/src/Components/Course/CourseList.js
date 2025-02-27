import React from 'react';
import { Grid } from '@mui/material';
import CourseCard from './CourseCard';

const CourseList = ({ courses }) => {
    return (
        <Grid container spacing={2} direction="column">
            {courses.map((course) => (
                <Grid item key={course.id}>
                    <CourseCard course={course} />
                </Grid>
            ))}
        </Grid>
    );
};

export default CourseList;