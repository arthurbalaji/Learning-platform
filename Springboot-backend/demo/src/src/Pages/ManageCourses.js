import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Container, Typography, Box, Button, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import CourseCard from '../Components/Course/CourseCard';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:8080/courses');
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);

    const handleAddCourse = () => {
        navigate('/admin-course');
    };

    const handleUpdateCourse = (courseId) => {
        navigate(`/admin-course/${courseId}`);
    };

    const handleDeleteClick = (course) => {
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`http://localhost:8080/courses/${courseToDelete.id}`);
            setCourses(courses.filter(course => course.id !== courseToDelete.id));
            setDeleteDialogOpen(false);
            setCourseToDelete(null);
            alert('Course deleted successfully!');
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error deleting course');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
    };

    return (
        <Container>
            <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" component="h1">
                    Manage Courses
                </Typography>
                <Button variant="contained" color="primary" onClick={handleAddCourse}>
                    Add New Course
                </Button>
            </Box>
            <Grid container spacing={2} mt={2}>
                {courses.map((course) => (
                    <Grid item key={course.id} xs={12} sm={6} md={4}>
                        <CourseCard course={course} />
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleUpdateCourse(course.id)}
                                fullWidth
                            >
                                Update Course
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleDeleteClick(course)}
                                fullWidth
                            >
                                Delete Course
                            </Button>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Delete Course</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ManageCourses;