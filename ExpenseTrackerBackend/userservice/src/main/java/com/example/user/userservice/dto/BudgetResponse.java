package com.example.user.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.YearMonth;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private Long categoryId;
    private String categoryName;
    private Double limitAmount;
    private Double spentAmount;
    private Double remainingAmount;
    private String month;
    private YearMonth yearMonth;
    private String status; // "UNDER_BUDGET", "OVER_BUDGET", "ON_TRACK"
    private Double percentageUsed;
}
