package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

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

    @OneToMany(mappedBy = "course")
    @JsonManagedReference(value = "course-progress")
    private List<Progress> progressList;
}
