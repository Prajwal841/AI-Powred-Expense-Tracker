package com.example.user.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryResponse {
    
    private Long userId;
    private String userName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalExpenses;
    private Integer totalTransactions;
    private Double averageExpense;
    private Map<String, Double> expensesByCategory;
    private Map<String, Integer> transactionsByCategory;
    private List<ExpenseResponse> recentExpenses;
    private Double highestExpense;
    private Double lowestExpense;
    private String mostExpensiveCategory;
    private String mostFrequentCategory;
}
