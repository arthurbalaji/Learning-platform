package com.example.demo.controller;

import com.example.demo.entity.Course;
import com.example.demo.entity.Lesson;
import com.example.demo.entity.Quiz;
import com.example.demo.entity.User;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @PostMapping("/add")
    public Course addCourse(@RequestBody Course course) {
        
            return courseService.addCourse(course);
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/{courseId}")
    public Optional<Course> getCourseDetails(@PathVariable Long courseId) {
        return courseService.getCourseDetails(courseId);
    }

    @PostMapping("/{courseId}/introductory-quiz")
    public Course addIntroductoryQuiz(@PathVariable Long courseId, @RequestBody Quiz quiz) {
        
            return courseService.addIntroductoryQuiz(courseId, quiz);
        
    }

    @PostMapping("/{courseId}/final-quiz")
    public Course addFinalQuiz(@PathVariable Long courseId, @RequestBody Quiz quiz) {
        
            return courseService.addFinalQuiz(courseId, quiz);
    
    }

    @PostMapping("/{courseId}/lessons")
    public Course addLesson(@PathVariable Long courseId, @RequestBody Lesson lesson) {
        
            return courseService.addLesson(courseId, lesson);
        
    }

    @PostMapping("/lessons/{lessonId}/quiz")
    public Lesson addQuizToLesson(@PathVariable Long lessonId, @RequestBody Quiz quiz) {
        
            return courseService.addQuizToLesson(lessonId, quiz);
        
    }

    @GetMapping("/{courseId}/introductory-quiz")
    public Optional<Quiz> getIntroductoryQuiz(@PathVariable Long courseId) {
        return courseService.getIntroductoryQuiz(courseId);
    }

    @GetMapping("/{courseId}/final-quiz")
    public Optional<Quiz> getFinalQuiz(@PathVariable Long courseId) {
        return courseService.getFinalQuiz(courseId);
    }

    @GetMapping("/{courseId}/lessons")
    public List<Lesson> getLessons(@PathVariable Long courseId) {
        return courseService.getLessons(courseId);
    }

    @GetMapping("/lessons/{lessonId}/quiz")
    public Optional<Quiz> getQuizOfLesson(@PathVariable Long lessonId) {
        return courseService.getQuizOfLesson(lessonId);
    }

    @GetMapping("/{courseId}/lessons/{lessonId}")
    public Optional<Lesson> getLesson(@PathVariable Long courseId, @PathVariable Long lessonId) {
        return courseService.getLesson(courseId, lessonId);
    }

    @GetMapping("/{courseId}/users/{userId}/completed-lessons")
    public List<Lesson> getCompletedLessons(@PathVariable Long courseId, @PathVariable Long userId) {
        return courseService.getCompletedLessons(userId, courseId);
    }

    @PutMapping("/{courseId}")
    public Course updateCourse(@PathVariable Long courseId, @RequestBody Course course) {
        return courseService.updateCourse(courseId, course);
    }

    @DeleteMapping("/{courseId}")
    public void deleteCourse(@PathVariable Long courseId) {
        courseService.deleteCourse(courseId);
    }
}