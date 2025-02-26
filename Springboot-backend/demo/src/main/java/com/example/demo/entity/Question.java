package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ElementCollection
    private List<Option> options;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @Embeddable
    @Getter
    @Setter
    public static class Option {
        private String text;
        private boolean isCorrect;
    }
}
