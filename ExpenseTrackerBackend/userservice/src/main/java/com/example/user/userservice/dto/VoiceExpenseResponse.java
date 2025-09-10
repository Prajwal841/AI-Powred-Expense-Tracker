package com.example.user.userservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VoiceExpenseResponse {
    private boolean success;
    private String message;
    private ExpenseResponse expense;
    private String parsedText;
    private String confidence;
}
