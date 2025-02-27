package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;

@Entity
@Getter
@Setter
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String imageUrl;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Lesson> lessons;

    @OneToOne(cascade = CascadeType.ALL)
    private Quiz introductoryQuiz;

    @OneToOne(cascade = CascadeType.ALL)
    private Quiz finalQuiz;

    @ManyToMany(mappedBy = "enrolledCourses")
    @JsonIgnore
    private Set<User> enrolledUsers = new HashSet<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "course-progress")
    private List<Progress> progressList = new ArrayList<>();
}
