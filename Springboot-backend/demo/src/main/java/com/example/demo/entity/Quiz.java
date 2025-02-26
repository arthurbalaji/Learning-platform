package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Question> questions;

    @OneToMany(mappedBy = "quiz")
    @JsonManagedReference(value = "quiz-quizSummary")
    private List<QuizSummary> quizSummaries;

}
