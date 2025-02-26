import React, { useContext, useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { UserContext } from '../Contexts/User';
import CourseList from '../Components/Course/CourseList';
import axios from 'axios';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Homepage = () => {
    const { user } = useContext(UserContext);
    const [inProgressCourses, setInProgressCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Try fetching each type of course separately to identify which request fails
                try {
                    const inProgressResponse = await axios.get(`http://localhost:8080/users/${user.id}/in-progress-courses`);
                    setInProgressCourses(inProgressResponse.data || []);
                } catch (error) {
                    console.error('Error fetching in-progress courses:', error.response?.data || error.message);
                    setInProgressCourses([]);
                }

                try {
                    const recommendedResponse = await axios.get(`http://localhost:8080/users/${user.id}/recommended-courses`);
                    setRecommendedCourses(recommendedResponse.data || []);
                } catch (error) {
                    console.error('Error fetching recommended courses:', error.response?.data || error.message);
                    setRecommendedCourses([]);
                }

                try {
                    const allCoursesResponse = await axios.get('http://localhost:8080/courses');
                    setAllCourses(allCoursesResponse.data || []);
                } catch (error) {
                    console.error('Error fetching all courses:', error.response?.data || error.message);
                    setAllCourses([]);
                }

            } catch (error) {
                const errorMessage = error.response?.data?.message || 
                                   error.response?.data || 
                                   error.message || 
                                   'Failed to load courses';
                console.error('Error details:', error.response?.data);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    const handleCourseClick = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    const renderCourses = (courses) => {
        if (courses.length === 0) {
            return (
                <Typography variant="body1" color="textSecondary">
                    No courses available
                </Typography>
            );
        }

        return (
            <Slider dots={true} infinite={false} speed={500} 
                    slidesToShow={Math.min(3, courses.length)} 
                    slidesToScroll={1}>
                {courses.map((course) => (
                    <Box key={course.id} p={2} 
                         onClick={() => handleCourseClick(course.id)} 
                         style={{ cursor: 'pointer' }}>
                        <CourseList courses={[course]} />
                    </Box>
                ))}
            </Slider>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4" component="h1">
                    Welcome, {user?.name || 'Guest'}!
                </Typography>
                
                <Typography variant="h6" component="h2" mt={4}>
                    Your In-Progress Courses
                </Typography>
                {renderCourses(inProgressCourses)}

                <Typography variant="h6" component="h2" mt={4}>
                    Recommended Courses
                </Typography>
                {renderCourses(recommendedCourses)}

                <Typography variant="h6" component="h2" mt={4}>
                    All Courses
                </Typography>
                {renderCourses(allCourses)}
            </Box>
        </Container>
    );
};

export default Homepage;