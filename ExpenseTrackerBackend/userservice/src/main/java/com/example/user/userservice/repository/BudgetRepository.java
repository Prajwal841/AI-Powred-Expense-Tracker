package com.example.user.userservice.repository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.user.userservice.entity.Budget;
import com.example.user.userservice.entity.Category;
import com.example.user.userservice.entity.User;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserAndCategoryAndMonth(User user, Category category, String month);
    List<Budget> findByUser(User user);
    long countByCategory(Category category);
}

