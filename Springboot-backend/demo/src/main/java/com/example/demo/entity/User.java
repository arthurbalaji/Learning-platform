package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String mailId;
    private String password;
    private Date dob;

    @ElementCollection
    private List<String> interests;

    @ManyToMany
    private List<Course> enrolledCourses;

    @ManyToMany
    private List<Course> recommendedCourses;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference(value = "user-quizSummary")
    private List<QuizSummary> quizSummaries;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference(value = "user-progress")
    private List<Progress> progressList;

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role {
        STUDENT,
        ADMIN
    }
}