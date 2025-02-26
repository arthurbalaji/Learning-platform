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

    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    const CourseCard = ({ course }) => (
        <Box
            onClick={() => handleCourseClick(course.id)}
            sx={{
                mx: 1,
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    transition: 'transform 0.3s ease'
                }
            }}
        >
            <Box
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    height: '100%'
                }}
            >
                <img
                    src={course.imageUrl || 'default-course-image.jpg'}
                    alt={course.name}
                    style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover'
                    }}
                />
                <Box p={2}>
                    <Typography 
                        variant="h6" 
                        noWrap 
                        sx={{ 
                            mb: 1,
                            fontWeight: 'bold'
                        }}
                    >
                        {course.name}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                            height: '3em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {course.description}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    const renderCourseSection = (title, courses) => (
        <Box mt={4}>
            <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                    mb: 3,
                    fontWeight: 'bold',
                    color: 'primary.main'
                }}
            >
                {title}
            </Typography>
            {courses.length > 0 ? (
                <Slider {...sliderSettings}>
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </Slider>
            ) : (
                <Typography variant="body1" color="text.secondary">
                    No courses available
                </Typography>
            )}
        </Box>
    );

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Fetch in-progress courses
                try {
                    const inProgressResponse = await axios.get(`http://localhost:8080/users/${user.id}/in-progress-courses`);
                    setInProgressCourses(inProgressResponse.data || []);
                } catch (error) {
                    console.error('Error fetching in-progress courses:', error.response?.data || error.message);
                    setInProgressCourses([]);
                }

                // Fetch recommended courses from Python API
                try {
                    const recommendedResponse = await axios.get(`http://localhost:5000/users/${user.id}/recommended-courses`);
                    setRecommendedCourses(recommendedResponse.data || []);
                } catch (error) {
                    console.error('Error fetching recommended courses:', error.response?.data || error.message);
                    setRecommendedCourses([]);
                    
                    // Fallback to Spring Boot API if Python API fails
                    try {
                        const fallbackResponse = await axios.get(`http://localhost:8080/users/${user.id}/recommended-courses`);
                        setRecommendedCourses(fallbackResponse.data || []);
                    } catch (fallbackError) {
                        console.error('Fallback recommendation failed:', fallbackError);
                    }
                }

                // Fetch all courses
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                    mb: 4,
                    fontWeight: 'bold',
                    color: 'primary.main'
                }}
            >
                Welcome, {user?.name || 'Guest'}!
            </Typography>

            {renderCourseSection('Continue Learning', inProgressCourses)}
            {renderCourseSection('Recommended for You', recommendedCourses)}
            {renderCourseSection('All Courses', allCourses)}
        </Container>
    );
};

export default Homepage;