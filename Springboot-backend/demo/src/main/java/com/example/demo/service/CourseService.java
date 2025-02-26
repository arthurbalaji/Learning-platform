package com.example.demo.service;

import com.example.demo.entity.Course;
import com.example.demo.entity.Lesson;
import com.example.demo.entity.Progress;
import com.example.demo.entity.Quiz;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.LessonRepository;
import com.example.demo.repository.ProgressRepository;
import com.example.demo.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ProgressRepository progressRepository;

    @jakarta.transaction.Transactional
    public Course addCourse(Course course) {
        if (course.getIntroductoryQuiz() != null) {
            quizRepository.save(course.getIntroductoryQuiz());
        }
        if (course.getFinalQuiz() != null) {
            quizRepository.save(course.getFinalQuiz());
        }
        if (course.getLessons() != null) {
            course.getLessons().forEach(lesson -> {
                if (lesson.getQuiz() != null) {
                    quizRepository.save(lesson.getQuiz());
                }
                lessonRepository.save(lesson);
            });
        }
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseDetails(Long courseId) {
        return courseRepository.findById(courseId);
    }

    public Course addIntroductoryQuiz(Long courseId, Quiz quiz) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        course.setIntroductoryQuiz(quiz);
        return courseRepository.save(course);
    }

    public Course addFinalQuiz(Long courseId, Quiz quiz) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        course.setFinalQuiz(quiz);
        return courseRepository.save(course);
    }

    public Course addLesson(Long courseId, Lesson lesson) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        course.getLessons().add(lesson);
        return courseRepository.save(course);
    }

    public Lesson addQuizToLesson(Long lessonId, Quiz quiz) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        lesson.setQuiz(quiz);
        return lessonRepository.save(lesson);
    }

    public Optional<Quiz> getIntroductoryQuiz(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        return Optional.ofNullable(course.getIntroductoryQuiz());
    }

    public Optional<Quiz> getFinalQuiz(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        return Optional.ofNullable(course.getFinalQuiz());
    }

    public List<Lesson> getLessons(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        return course.getLessons();
    }

    public Optional<Quiz> getQuizOfLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        return Optional.ofNullable(lesson.getQuiz());
    }

    public Optional<Lesson> getLesson(Long courseId, Long lessonId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        return course.getLessons().stream()
                .filter(lesson -> lesson.getId().equals(lessonId))
                .findFirst();
    }

    public String getLessonStatus(Long userId, Long courseId, Long lessonId) {
        Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId).orElseThrow();
        if (progress.getCompletedLessons().stream().anyMatch(lesson -> lesson.getId().equals(lessonId))) {
            return "Completed";
        } else {
            return "In Progress";
        }
    }

    public Progress addLessonToInProgress(Long userId, Long courseId, Long lessonId) {
        Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId).orElseThrow();
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();
        if (!progress.getCompletedLessons().contains(lesson)) {
            progress.getCompletedLessons().add(lesson);
            progressRepository.save(progress);
        }
        return progress;
    }

    public double getCourseCompletionPercentage(Long userId, Long courseId) {
        Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId).orElseThrow();
        int totalLessons = progress.getCourse().getLessons().size();
        int completedLessons = progress.getCompletedLessons().size();
        return (double) completedLessons / totalLessons * 100;
    }

    public List<Lesson> getCompletedLessons(Long userId, Long courseId) {
        Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Progress not found"));
        return progress.getCompletedLessons();
    }

    @jakarta.transaction.Transactional
    public Course updateCourse(Long courseId, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Update basic course information
        existingCourse.setName(updatedCourse.getName());
        existingCourse.setDescription(updatedCourse.getDescription());
        existingCourse.setImageUrl(updatedCourse.getImageUrl());

        // Update or set introductory quiz
        if (updatedCourse.getIntroductoryQuiz() != null) {
            if (existingCourse.getIntroductoryQuiz() != null) {
                updatedCourse.getIntroductoryQuiz().setId(existingCourse.getIntroductoryQuiz().getId());
            }
            quizRepository.save(updatedCourse.getIntroductoryQuiz());
            existingCourse.setIntroductoryQuiz(updatedCourse.getIntroductoryQuiz());
        }

        // Update or set final quiz
        if (updatedCourse.getFinalQuiz() != null) {
            if (existingCourse.getFinalQuiz() != null) {
                updatedCourse.getFinalQuiz().setId(existingCourse.getFinalQuiz().getId());
            }
            quizRepository.save(updatedCourse.getFinalQuiz());
            existingCourse.setFinalQuiz(updatedCourse.getFinalQuiz());
        }

        // Update lessons
        if (updatedCourse.getLessons() != null) {
            // Clear existing lessons
            existingCourse.getLessons().clear();
            
            // Add updated lessons
            updatedCourse.getLessons().forEach(lesson -> {
                if (lesson.getQuiz() != null) {
                    quizRepository.save(lesson.getQuiz());
                }
                lessonRepository.save(lesson);
            });
            existingCourse.setLessons(updatedCourse.getLessons());
        }

        return courseRepository.save(existingCourse);
    }

    @jakarta.transaction.Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Delete associated quizzes
        if (course.getIntroductoryQuiz() != null) {
            quizRepository.delete(course.getIntroductoryQuiz());
        }
        if (course.getFinalQuiz() != null) {
            quizRepository.delete(course.getFinalQuiz());
        }
        
        // Delete associated lessons and their quizzes
        if (course.getLessons() != null) {
            course.getLessons().forEach(lesson -> {
                if (lesson.getQuiz() != null) {
                    quizRepository.delete(lesson.getQuiz());
                }
                lessonRepository.delete(lesson);
            });
        }
        
        courseRepository.delete(course);
    }
}