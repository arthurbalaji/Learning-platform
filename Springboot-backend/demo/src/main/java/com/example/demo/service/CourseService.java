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
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.hibernate.Hibernate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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
        List<Course> courses = courseRepository.findAll();
        // Initialize lazy collections
        courses.forEach(course -> {
            Hibernate.initialize(course.getLessons());
            if (course.getIntroductoryQuiz() != null) {
                Hibernate.initialize(course.getIntroductoryQuiz());
            }
            if (course.getFinalQuiz() != null) {
                Hibernate.initialize(course.getFinalQuiz());
            }
        });
        return courses;
    }

    public Optional<Course> getCourseDetails(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        courseOpt.ifPresent(course -> {
            Hibernate.initialize(course.getLessons());
            if (course.getIntroductoryQuiz() != null) {
                Hibernate.initialize(course.getIntroductoryQuiz());
            }
            if (course.getFinalQuiz() != null) {
                Hibernate.initialize(course.getFinalQuiz());
            }
        });
        return courseOpt;
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
        if (totalLessons == 0) return 0.0;
        
        int completedLessons = progress.getCompletedLessons().size();
        return (double) completedLessons / totalLessons * 100;
    }

    public List<Lesson> getCompletedLessons(Long userId, Long courseId) {
        Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
        Set<Lesson> completedLessons = progress.getCompletedLessons();
        // Initialize lazy-loaded lessons
        completedLessons.forEach(Hibernate::initialize);
        return new ArrayList<>(completedLessons);
    }

    @jakarta.transaction.Transactional
    public Course updateCourse(Long courseId, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow();

        // Update basic course information safely
        if (updatedCourse.getName() != null) {
            existingCourse.setName(updatedCourse.getName());
        }
        if (updatedCourse.getDescription() != null) {
            existingCourse.setDescription(updatedCourse.getDescription());
        }
        if (updatedCourse.getImageUrl() != null) {
            existingCourse.setImageUrl(updatedCourse.getImageUrl());
        }

        // Handle introductory quiz update
        updateIntroductoryQuiz(existingCourse, updatedCourse);

        // Handle final quiz update
        updateFinalQuiz(existingCourse, updatedCourse);

        // Handle lessons update
        updateLessons(existingCourse, updatedCourse);

        return courseRepository.save(existingCourse);
    }

    private void updateIntroductoryQuiz(Course existingCourse, Course updatedCourse) {
        if (updatedCourse.getIntroductoryQuiz() != null) {
            Quiz quiz = updatedCourse.getIntroductoryQuiz();
            if (existingCourse.getIntroductoryQuiz() != null) {
                quiz.setId(existingCourse.getIntroductoryQuiz().getId());
            }
            quiz = quizRepository.save(quiz);
            existingCourse.setIntroductoryQuiz(quiz);
        }
    }

    private void updateFinalQuiz(Course existingCourse, Course updatedCourse) {
        if (updatedCourse.getFinalQuiz() != null) {
            Quiz quiz = updatedCourse.getFinalQuiz();
            if (existingCourse.getFinalQuiz() != null) {
                quiz.setId(existingCourse.getFinalQuiz().getId());
            }
            quiz = quizRepository.save(quiz);
            existingCourse.setFinalQuiz(quiz);
        }
    }

    private void updateLessons(Course existingCourse, Course updatedCourse) {
        if (updatedCourse.getLessons() != null && !updatedCourse.getLessons().isEmpty()) {
            List<Lesson> currentLessons = new ArrayList<>(existingCourse.getLessons());
            existingCourse.getLessons().clear();

            updatedCourse.getLessons().forEach(lesson -> {
                if (lesson.getQuiz() != null) {
                    quizRepository.save(lesson.getQuiz());
                }
                Lesson savedLesson = lessonRepository.save(lesson);
                existingCourse.getLessons().add(savedLesson);
            });

            // Clean up any orphaned lessons
            currentLessons.forEach(lesson -> {
                if (!existingCourse.getLessons().contains(lesson)) {
                    lessonRepository.delete(lesson);
                }
            });
        }
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