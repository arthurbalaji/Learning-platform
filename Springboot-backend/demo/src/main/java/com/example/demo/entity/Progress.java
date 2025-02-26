package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-progress")
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference(value = "course-progress")
    private Course course;

    @OneToMany
    private List<Lesson> completedLessons;

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
        // Only update status if it's not already COMPLETED
        if (status != Status.COMPLETED) {
            if (completedLessons == null || completedLessons.isEmpty()) {
                status = Status.ENROLLED;
            } else {
                status = Status.IN_PROGRESS;
            }
        }
    }

    // Method to explicitly set status to COMPLETED
    public void markAsCompleted() {
        this.status = Status.COMPLETED;
    }
}
