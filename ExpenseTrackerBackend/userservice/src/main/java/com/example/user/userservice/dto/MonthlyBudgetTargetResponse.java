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
public class MonthlyBudgetTargetResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private Double targetAmount;
    private String month;
    private YearMonth yearMonth;
    private boolean isActive;
}
