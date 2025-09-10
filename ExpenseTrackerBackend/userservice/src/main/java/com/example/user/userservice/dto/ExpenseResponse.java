package com.example.user.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Double amount;
    private LocalDate date;
    private String source;
    private String receiptPath;
    private String paymentMethod;
    private String tags;
    private List<String> tagList; // parsed tags
    private String formattedDate; // formatted date string
    private String formattedAmount; // formatted amount with currency
}
