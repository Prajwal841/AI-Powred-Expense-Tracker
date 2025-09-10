package com.example.user.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryResponse {
    
    private Long userId;
    private String userName;
    private String month;
    private Double totalBudget;
    private Double targetBudget; // new field for user's target budget
    private Double totalSpent;
    private Double totalRemaining;
    private Double overallPercentageUsed;
    private String overallStatus;
    private List<BudgetResponse> budgets;
    private Integer totalCategories;
    private Integer categoriesUnderBudget;
    private Integer categoriesOverBudget;
    private Double targetVsActualPercentage; // percentage of target budget used
}
