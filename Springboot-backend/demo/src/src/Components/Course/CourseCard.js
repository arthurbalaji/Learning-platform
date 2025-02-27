import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

const CourseCard = ({ course }) => {
    return (
        <Card>
            <CardMedia
                component="img"
                height="140"
                image={course.imageUrl}
                alt={course.name}
            />
            <CardContent>
                <Typography variant="h5" component="div">
                    {course.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {course.description}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default CourseCard;