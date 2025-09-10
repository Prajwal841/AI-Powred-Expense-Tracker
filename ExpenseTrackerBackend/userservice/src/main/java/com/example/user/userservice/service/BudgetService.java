package com.example.user.userservice.service;

import com.example.user.userservice.dto.BudgetRequest;
import com.example.user.userservice.dto.BudgetResponse;
import com.example.user.userservice.dto.BudgetSummaryResponse;

import java.util.List;

public interface BudgetService {
    
    BudgetResponse createBudget(Long userId, BudgetRequest request);
    
    BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request);
    
    BudgetResponse getBudgetById(Long userId, Long budgetId);
    
    List<BudgetResponse> getAllBudgetsByUser(Long userId);
    
    List<BudgetResponse> getBudgetsByUserAndMonth(Long userId, String month);
    
    BudgetSummaryResponse getBudgetSummary(Long userId, String month);
    
    void deleteBudget(Long userId, Long budgetId);
    
    boolean existsByUserAndCategoryAndMonth(Long userId, Long categoryId, String month);
}
