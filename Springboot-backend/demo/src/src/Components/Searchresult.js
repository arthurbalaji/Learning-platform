import React from 'react';
import { Grid } from '@mui/material';
import CourseCard from './Course/CourseCard';

const SearchResult = ({ courses }) => {
    return (
        <Grid container spacing={2}>
            {courses.map((course) => (
                <Grid item key={course.id} xs={12} sm={6} md={4}>
                    <CourseCard course={course} />
                </Grid>
            ))}
        </Grid>
    );
};

export default SearchResult;