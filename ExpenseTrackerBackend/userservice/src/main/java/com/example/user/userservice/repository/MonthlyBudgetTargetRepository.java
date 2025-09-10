package com.example.user.userservice.repository;

import java.time.YearMonth;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.user.userservice.entity.MonthlyBudgetTarget;
import com.example.user.userservice.entity.User;

@Repository
public interface MonthlyBudgetTargetRepository extends JpaRepository<MonthlyBudgetTarget, Long> {
    Optional<MonthlyBudgetTarget> findByUserAndMonthAndIsActiveTrue(User user, String month);
    Optional<MonthlyBudgetTarget> findByUserAndMonth(User user, String month);
}
