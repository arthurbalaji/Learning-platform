package com.example.demo.repository;

import com.example.demo.entity.Quiz;
import com.example.demo.entity.QuizSummary;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizSummaryRepository extends JpaRepository<QuizSummary, Long> {
    List<QuizSummary> findByUserAndQuiz(User user, Quiz quiz);
}