import React, { useContext, useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { UserContext } from '../Contexts/User';
import CourseList from '../Components/Course/CourseList';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const EnrolledCourses = () => {
    const { user } = useContext(UserContext);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [inProgressCourses, setInProgressCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/users/${user.id}/enrolled-courses`);
                setEnrolledCourses(response.data);
            } catch (error) {
                console.error('Error fetching enrolled courses:', error);
            }
        };

        const fetchInProgressCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/users/${user.id}/in-progress-courses`);
                setInProgressCourses(response.data);
            } catch (error) {
                console.error('Error fetching in-progress courses:', error);
            }
        };

        const fetchCompletedCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/users/${user.id}/completed-courses`);
                setCompletedCourses(response.data);
            } catch (error) {
                console.error('Error fetching completed courses:', error);
            }
        };

        if (user) {
            fetchEnrolledCourses();
            fetchInProgressCourses();
            fetchCompletedCourses();
        }
    }, [user]);

    const handleCourseClick = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    const renderCourses = (courses) => (
        <Slider dots={true} infinite={false} speed={500} slidesToShow={3} slidesToScroll={1}>
            {courses.map((course) => (
                <Box key={course.id} p={2} onClick={() => handleCourseClick(course.id)} style={{ cursor: 'pointer' }}>
                    <CourseList courses={[course]} />
                </Box>
            ))}
        </Slider>
    );

    return (
        <Container>
            <Box mt={4}>
                <Typography variant="h4" component="h1">
                    Enrolled Courses
                </Typography>
                <Typography variant="h6" component="h2" mt={2}>
                    All Enrolled Courses
                </Typography>
                {renderCourses(enrolledCourses)}
                <Typography variant="h6" component="h2" mt={4}>
                    In-Progress Courses
                </Typography>
                {renderCourses(inProgressCourses)}
                <Typography variant="h6" component="h2" mt={4}>
                    Completed Courses
                </Typography>
                {renderCourses(completedCourses)}
            </Box>
        </Container>
    );
};

export default EnrolledCourses;