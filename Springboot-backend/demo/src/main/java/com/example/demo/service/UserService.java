package com.example.demo.service;

import com.example.demo.entity.Course;
import com.example.demo.entity.Lesson;
import com.example.demo.entity.Progress;
import com.example.demo.entity.Question;
import com.example.demo.entity.Quiz;
import com.example.demo.entity.QuizSummary;
import com.example.demo.entity.User;
import com.example.demo.entity.QuizSummary.QuestionSummary;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.ProgressRepository;

import com.example.demo.repository.QuizRepository;
import com.example.demo.repository.QuizSummaryRepository;

import com.example.demo.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private QuizSummaryRepository quizSummaryRepository;

    

    public User registerUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> loginUser(String mailId, String password) {
        Optional<User> user = userRepository.findByMailId(mailId);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        }
        return Optional.empty();
    }

    public User enrollCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        user.getEnrolledCourses().add(course);

        Progress progress = new Progress();
        progress.setUser(user);
        progress.setCourse(course);
        progress.setCompletedLessons(List.of());
        progressRepository.save(progress);

        return userRepository.save(user);
    }

    public User completeCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        user.getEnrolledCourses().remove(course);

        Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId).orElseThrow();
        progress.setStatus(Progress.Status.COMPLETED);
        progressRepository.save(progress);

        return userRepository.save(user);
    }

    public User updateRecommendedCourses(Long userId, List<Course> recommendedCourses) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setRecommendedCourses(recommendedCourses);
        return userRepository.save(user);
    }

    public List<QuizSummary> getQuizResults(Long userId, Long quizId) {
        User user = userRepository.findById(userId).orElseThrow();
        return user.getQuizSummaries().stream()
                .filter(quizSummary -> quizSummary.getQuiz().getId().equals(quizId))
                .toList();
    }

    public List<Course> getEnrolledCourses(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return user.getEnrolledCourses();
    }

    public List<Course> getCompletedCourses(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return user.getProgressList().stream()
                .filter(progress -> progress.getStatus() == Progress.Status.COMPLETED)
                .map(Progress::getCourse)
                .toList();
    }

    public List<Course> getInProgressCourses(Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
            log.debug("Fetching in-progress courses for user: {}", userId);
            
            List<Course> inProgressCourses = user.getEnrolledCourses().stream()
                .filter(course -> {
                    Optional<Progress> progress = progressRepository.findByUserIdAndCourseId(userId, course.getId());
                    return progress.map(p -> p.getStatus() == Progress.Status.IN_PROGRESS).orElse(false);
                })
                .collect(Collectors.toList());
            
            log.debug("Found {} in-progress courses", inProgressCourses.size());
            return inProgressCourses;
            
        } catch (Exception e) {
            log.error("Error fetching in-progress courses: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching courses");
        }
    }

    public List<Course> getRecommendedCourses(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return user.getRecommendedCourses();
    }

    public Optional<User> getUserDetails(Long userId) {
        return userRepository.findById(userId);
    }

    public User updateUserDetails(Long userId, User updatedUser) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setName(updatedUser.getName());
        user.setMailId(updatedUser.getMailId());
        user.setPassword(updatedUser.getPassword());
        user.setDob(updatedUser.getDob());
        user.setInterests(updatedUser.getInterests());
        return userRepository.save(user);
    }

    @Transactional
    public QuizSummary addIntroQuizSummary(Long userId, Long courseId, List<QuestionSummary> questionSummaries) {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        
        QuizSummary quizSummary = new QuizSummary();
        quizSummary.setUser(user);
        quizSummary.setQuiz(course.getIntroductoryQuiz());
        quizSummary.setQuestionSummaries(questionSummaries);

        // Calculate the score
        int score = calculateScore(questionSummaries);
        quizSummary.setScore(score);
        
        return quizSummaryRepository.save(quizSummary);
    }

    @Transactional
    public QuizSummary addFinalQuizSummary(Long userId, Long courseId, List<QuestionSummary> questionSummaries) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        QuizSummary quizSummary = new QuizSummary();
        quizSummary.setUser(user);
        quizSummary.setQuiz(course.getFinalQuiz());
        quizSummary.setQuestionSummaries(questionSummaries);

        // Calculate the score
        int score = calculateScore(questionSummaries);
        quizSummary.setScore(score);
        
        // If score is >= 80%, mark the course as completed
        if (score >= 80) {
            Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
            
            progress.setStatus(Progress.Status.COMPLETED);
            progressRepository.save(progress);
            
            // Remove from enrolled courses and add to completed courses
            user.getEnrolledCourses().remove(course);
            userRepository.save(user);
        }
        
        return quizSummaryRepository.save(quizSummary);
    }

    @Transactional
    public QuizSummary addLessonQuizSummary(Long userId, Long courseId, Long lessonId, List<QuestionSummary> questionSummaries) {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        Lesson lesson = course.getLessons().stream()
                .filter(l -> l.getId().equals(lessonId))
                .findFirst()
                .orElseThrow();
        
        QuizSummary quizSummary = new QuizSummary();
        quizSummary.setUser(user);
        quizSummary.setQuiz(lesson.getQuiz());
        quizSummary.setQuestionSummaries(questionSummaries);

        // Calculate the score
        int score = calculateScore(questionSummaries);
        quizSummary.setScore(score);
        
        // If score is >= 80%, mark the lesson as completed
        if (score >= 80) {
            Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
            
            List<Lesson> completedLessons = progress.getCompletedLessons();
            if (!completedLessons.contains(lesson)) {
                completedLessons.add(lesson);
                progress.setCompletedLessons(completedLessons);
                progressRepository.save(progress);
            }
        }
        
        return quizSummaryRepository.save(quizSummary);
    }

    private int calculateScore(List<QuestionSummary> questionSummaries) {
        int totalQuestions = questionSummaries.size();
        int correctAnswers = (int) questionSummaries.stream()
                .filter(QuestionSummary::isCorrect)
                .count();
        return (int) ((double) correctAnswers / totalQuestions * 100);
    }

    

    

    

    @Transactional
    public QuizSummary getIntroQuizSummary(Long userId, Long courseId, Long quizSummaryId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        QuizSummary quizSummary = quizSummaryRepository.findById(quizSummaryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Introductory quiz summary not found"));
        if (!quizSummary.getUser().equals(user) || !quizSummary.getQuiz().equals(course.getIntroductoryQuiz())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Introductory quiz summary not found");
        }
        return quizSummary;
    }

    @Transactional
    public QuizSummary getFinalQuizSummary(Long userId, Long courseId, Long quizSummaryId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        QuizSummary quizSummary = quizSummaryRepository.findById(quizSummaryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Final quiz summary not found"));
        if (!quizSummary.getUser().equals(user) || !quizSummary.getQuiz().equals(course.getFinalQuiz())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Final quiz summary not found");
        }
        return quizSummary;
    }

    @Transactional
    public QuizSummary getLessonQuizSummary(Long userId, Long courseId, Long lessonId, Long quizSummaryId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        Lesson lesson = course.getLessons().stream()
                .filter(l -> l.getId().equals(lessonId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        QuizSummary quizSummary = quizSummaryRepository.findById(quizSummaryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson quiz summary not found"));
        if (!quizSummary.getUser().equals(user) || !quizSummary.getQuiz().equals(lesson.getQuiz())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson quiz summary not found");
        }
        return quizSummary;
    }

    @Transactional
    public List<QuizSummary> getIntroQuizSummaries(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Find all quiz summaries for this user and the course's introductory quiz
        return quizSummaryRepository.findByUserAndQuiz(user, course.getIntroductoryQuiz());
    }

    @Transactional
    public List<QuizSummary> getFinalQuizSummaries(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Find all quiz summaries for this user and the course's final quiz
        return quizSummaryRepository.findByUserAndQuiz(user, course.getFinalQuiz());
    }
}
