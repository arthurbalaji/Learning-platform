package com.example.demo.controller;

import com.example.demo.entity.Course;
import com.example.demo.entity.QuizSummary;
import com.example.demo.entity.User;
import com.example.demo.entity.QuizSummary.QuestionSummary;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public Optional<User> loginUser(@RequestParam String mailId, @RequestParam String password) {
        return userService.loginUser(mailId, password);
    }

    @PostMapping("/{userId}/enroll/{courseId}")
    public User enrollCourse(@PathVariable Long userId, @PathVariable Long courseId) {
        return userService.enrollCourse(userId, courseId);
    }

    @PostMapping("/{userId}/complete/{courseId}")
    public User completeCourse(@PathVariable Long userId, @PathVariable Long courseId) {
        return userService.completeCourse(userId, courseId);
    }

    @PutMapping("/{userId}/recommended")
    public User updateRecommendedCourses(@PathVariable Long userId, @RequestBody List<Course> recommendedCourses) {
        return userService.updateRecommendedCourses(userId, recommendedCourses);
    }

    @GetMapping("/{userId}/quiz/{quizId}/results")
    public List<QuizSummary> getQuizResults(@PathVariable Long userId, @PathVariable Long quizId) {
        return userService.getQuizResults(userId, quizId);
    }

    @GetMapping("/{userId}/enrolled-courses")
    public List<Course> getEnrolledCourses(@PathVariable Long userId) {
        return userService.getEnrolledCourses(userId);
    }

    @GetMapping("/{userId}/completed-courses")
    public List<Course> getCompletedCourses(@PathVariable Long userId) {
        return userService.getCompletedCourses(userId);
    }

    @GetMapping("/{userId}/in-progress-courses")
    public ResponseEntity<List<Course>> getInProgressCourses(@PathVariable Long userId) {
        try {
            List<Course> courses = userService.getInProgressCourses(userId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body(null);
        }
    }

    @GetMapping("/{userId}/recommended-courses")
    public List<Course> getRecommendedCourses(@PathVariable Long userId) {
        return userService.getRecommendedCourses(userId);
    }

    @GetMapping("/{userId}")
    public Optional<User> getUserDetails(@PathVariable Long userId) {
        return userService.getUserDetails(userId);
    }

    @PutMapping("/{userId}")
    public User updateUserDetails(@PathVariable Long userId, @RequestBody User updatedUser) {
        return userService.updateUserDetails(userId, updatedUser);
    }

    @PostMapping("/{userId}/courses/{courseId}/intro-quiz")
    public ResponseEntity<QuizSummary> submitIntroQuiz(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @RequestBody Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            List<QuestionSummary> questionSummaries = 
                objectMapper.convertValue(payload.get("questionSummaries"), 
                    new TypeReference<List<QuestionSummary>>() {});
            
            QuizSummary summary = userService.addIntroQuizSummary(userId, courseId, questionSummaries);
            return new ResponseEntity<>(summary, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Invalid quiz submission: " + e.getMessage());
        }
    }

    @PostMapping("/{userId}/courses/{courseId}/final-quiz")
    public ResponseEntity<QuizSummary> submitFinalQuiz(
        @PathVariable Long userId,
        @PathVariable Long courseId,
        @RequestBody Map<String, Object> payload) {
    try {
        @SuppressWarnings("unchecked")
        List<QuestionSummary> questionSummaries = 
            objectMapper.convertValue(payload.get("questionSummaries"), 
                new TypeReference<List<QuestionSummary>>() {});
        
        QuizSummary summary = userService.addFinalQuizSummary(userId, courseId, questionSummaries);
        return new ResponseEntity<>(summary, HttpStatus.CREATED);
    } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
            "Invalid quiz submission: " + e.getMessage());
    }
    }

    @PostMapping("/{userId}/courses/{courseId}/lessons/{lessonId}/quiz")
    public ResponseEntity<QuizSummary> submitLessonQuiz(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @RequestBody List<QuestionSummary> questionSummaries) {
        QuizSummary summary = userService.addLessonQuizSummary(userId, courseId, lessonId, questionSummaries);
        return new ResponseEntity<>(summary, HttpStatus.CREATED);
    }

    @GetMapping("/{userId}/courses/{courseId}/intro-quiz-summary/{quizSummaryId}")
    public ResponseEntity<QuizSummary> getIntroQuizSummary(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @PathVariable Long quizSummaryId) {
        QuizSummary summary = userService.getIntroQuizSummary(userId, courseId, quizSummaryId);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @GetMapping("/{userId}/courses/{courseId}/intro-quiz-summaries")
    public ResponseEntity<List<QuizSummary>> getIntroQuizSummaries(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        List<QuizSummary> summaries = userService.getIntroQuizSummaries(userId, courseId);
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/{userId}/courses/{courseId}/final-quiz-summary/{quizSummaryId}")
    public ResponseEntity<QuizSummary> getFinalQuizSummary(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @PathVariable Long quizSummaryId) {
        QuizSummary summary = userService.getFinalQuizSummary(userId, courseId, quizSummaryId);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @GetMapping("/{userId}/courses/{courseId}/final-quiz-summaries")
    public ResponseEntity<List<QuizSummary>> getFinalQuizSummaries(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        List<QuizSummary> summaries = userService.getFinalQuizSummaries(userId, courseId);
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/{userId}/courses/{courseId}/lessons/{lessonId}/quiz-summary/{quizSummaryId}")
    public ResponseEntity<QuizSummary> getLessonQuizSummary(
            @PathVariable Long userId,
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @PathVariable Long quizSummaryId) {
        QuizSummary summary = userService.getLessonQuizSummary(userId, courseId, lessonId, quizSummaryId);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }
}
