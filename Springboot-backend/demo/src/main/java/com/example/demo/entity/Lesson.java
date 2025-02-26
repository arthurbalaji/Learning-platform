package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String youtubeVideoLink;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;

    @OneToOne(cascade = CascadeType.ALL)
    private Quiz quiz;

    public enum DifficultyLevel {
        EASY,
        MEDIUM,
        HARD
    }
}
