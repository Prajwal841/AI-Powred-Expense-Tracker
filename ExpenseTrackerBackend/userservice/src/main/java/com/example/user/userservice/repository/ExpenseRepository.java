package com.example.user.userservice.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.user.userservice.entity.Category;
import com.example.user.userservice.entity.Expense;
import com.example.user.userservice.entity.User;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser(User user);
    List<Expense> findByCategory(Category category);
    List<Expense> findByDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.category.name = :categoryName")
    List<Expense> findByUserAndCategory(@Param("userId") Long userId, @Param("categoryName") String categoryName);
    
    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.category.id = :categoryId AND FUNCTION('DATE_FORMAT', e.date, '%Y-%m') = :month")
    List<Expense> findByUserAndCategoryAndMonth(@Param("userId") Long userId, @Param("categoryId") Long categoryId, @Param("month") String month);
    
    @Query("SELECT e FROM Expense e WHERE e.user = :user AND e.receiptPath IS NOT NULL")
    List<Expense> findByUserAndReceiptPathIsNotNull(@Param("user") User user);
    
    long countByCategory(Category category);
}
