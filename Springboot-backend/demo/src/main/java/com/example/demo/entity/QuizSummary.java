package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Getter
@Setter
public class QuizSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    @JsonBackReference(value = "quiz-quizSummary")
    private Quiz quiz;

    @ManyToOne
    @JsonBackReference(value = "user-quizSummary")
    @JoinColumn(name = "user_id")
    private User user;

    @ElementCollection
    private List<QuestionSummary> questionSummaries;

    private int score;

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    @Embeddable
    @Getter
    @Setter
    public static class QuestionSummary {
        @ManyToOne
        @JoinColumn(name = "question_id")
        private Question question;
        
        private boolean isCorrect;
        private Integer selectedOptionIndex;

        public void checkAnswer() {
            if (question != null && selectedOptionIndex != null) {
                this.isCorrect = question.getOptions().get(selectedOptionIndex).isCorrect();
            }
        }
    }
}
