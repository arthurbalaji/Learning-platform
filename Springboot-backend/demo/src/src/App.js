import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './Contexts/User';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import Homepage from './Pages/Homepage';
import ManageCourses from './Pages/ManageCourses';
import Menubar from './Components/Menubar';
import SearchPage from './Pages/Searchpage';
import Course from './Pages/Course';
import Profile from './Pages/profile';
import Quiz from './Pages/Quiz';
import QuizResults from './Pages/QuizSummary';
import AdminCourse from './Pages/AdminCourse';
import EnrolledCourses from './Pages/EnrolledCourses';
import Certificates from './Pages/Certificates';
import IntroductoryQuiz from './Pages/IntoductoryQuiz';
import Learn from './Pages/Learn';
import FinalQuiz from './Pages/FinalQuiz';
const PrivateRoute = ({ children }) => {
    const { user } = useUser();
    const location = useLocation();
    
    if (!user) {
        // Redirect to login while saving the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

const App = () => {
    return (
        <UserProvider>
            <Router>
                <ConditionalMenubar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Routes */}
                    <Route path="/Homepage" element={
                        <PrivateRoute>
                            <Homepage />
                        </PrivateRoute>
                    } />
                    <Route path="/certificates" element={
                        <PrivateRoute>
                            <Certificates />
                        </PrivateRoute>
                    } />
                    
                    <Route path="/ManageCourses" element={
                        <PrivateRoute>
                            <ManageCourses />
                        </PrivateRoute>
                    } />
                    <Route path="/search" element={
                        <PrivateRoute>
                            <SearchPage />
                        </PrivateRoute>
                    } />
                    <Route path="/courses/:courseId" element={
                        <PrivateRoute>
                            <Course />
                        </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />
                    <Route path="/quiz/:quizId" element={
                        <PrivateRoute>
                            <Quiz />
                        </PrivateRoute>
                    } />
                    <Route path="/quiz-results" element={
                        <PrivateRoute>
                            <QuizResults />
                        </PrivateRoute>
                    } />
                    <Route path="/admin-course/:courseId" element={
                        <PrivateRoute>
                            <AdminCourse />
                        </PrivateRoute>
                    } />
                    <Route path="/admin-course" element={
                        <PrivateRoute>
                            <AdminCourse />
                        </PrivateRoute>
                    } />
                    <Route path="/enrolled-courses" element={
                        <PrivateRoute>
                            <EnrolledCourses />
                        </PrivateRoute>
                    } />
                    <Route path="/courses/:courseId/introductory-quiz" element={
                        <PrivateRoute>
                            <IntroductoryQuiz />
                        </PrivateRoute>
                    } />
                    <Route path="/courses/:courseId/final-quiz" element={
                        <PrivateRoute>
                            <FinalQuiz />
                        </PrivateRoute>
                    } />
                    <Route path="/learn/:courseId/:lessonId" element={
                        <PrivateRoute>
                            <Learn />
                        </PrivateRoute>
                    } />
                    <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={
                        <PrivateRoute>
                            <Quiz />
                        </PrivateRoute>
                    } />
                    <Route path="/quiz-summary" element={
                        <PrivateRoute>
                            <QuizResults />
                        </PrivateRoute>
                    } />
                    
                    {/* Redirect root path to Homepage */}
                    <Route path="/" element={<Navigate to="/Homepage" replace />} />
                </Routes>
            </Router>
        </UserProvider>
    );
};

const ConditionalMenubar = () => {
    const location = useLocation();
    const hideMenubarPaths = ['/login', '/register'];

    return !hideMenubarPaths.includes(location.pathname) ? <Menubar /> : null;
};

export default App;