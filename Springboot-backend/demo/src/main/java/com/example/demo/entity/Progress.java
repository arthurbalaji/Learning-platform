package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "course_id"})
})
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference(value = "user-progress")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonBackReference(value = "course-progress")
    private Course course;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "progress_completed_lessons",
        joinColumns = @JoinColumn(name = "progress_id"),
        inverseJoinColumns = @JoinColumn(name = "lesson_id"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"progress_id", "lesson_id"})
    )
    private Set<Lesson> completedLessons = new HashSet<>();

    // Add helper methods for managing completedLessons
    public void addCompletedLesson(Lesson lesson) {
        if (completedLessons == null) {
            completedLessons = new HashSet<>();
        }
        completedLessons.add(lesson);
    }

    public void removeCompletedLesson(Lesson lesson) {
        if (completedLessons != null) {
            completedLessons.remove(lesson);
        }
    }

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        ENROLLED,
        IN_PROGRESS,
        COMPLETED
    }

    @PrePersist
    private void setInitialStatus() {
        if (status == null) {
            status = Status.ENROLLED;
        }
    }

    @PreUpdate
    private void updateStatus() {
        // Only update status if it's not already COMPLETED or IN_PROGRESS
        if (status != Status.COMPLETED && status != Status.IN_PROGRESS) {
            
                status = Status.ENROLLED;
            
        }
    }

    // Method to explicitly set status to IN_PROGRESS
    public void markAsInProgress() {
        if (status != Status.COMPLETED) {
            this.status = Status.IN_PROGRESS;
        }
    }

    // Method to explicitly set status to COMPLETED
    public void markAsCompleted() {
        this.status = Status.COMPLETED;
    }
}
