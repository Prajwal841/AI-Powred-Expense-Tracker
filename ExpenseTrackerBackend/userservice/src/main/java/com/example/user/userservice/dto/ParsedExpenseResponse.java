package com.example.user.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedExpenseResponse {
    
    private Long expenseId;
    private String name;
    private String category;
    private String subcategory;
    private Double amount;
    private String currency;
    private LocalDate date;
    private String description;
    private String merchant;
    private double confidence;
    private String source;
}
