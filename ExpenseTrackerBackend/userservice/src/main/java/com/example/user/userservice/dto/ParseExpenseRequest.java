package com.example.user.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParseExpenseRequest {
    
    @NotBlank(message = "Text is required")
    private String text;
    
    @NotBlank(message = "Timezone is required")
    private String timezone; // e.g. "Asia/Kolkata"
    
    @NotBlank(message = "Currency is required")
    private String currency; // e.g. "INR"
    
    @NotBlank(message = "Locale is required")
    private String locale; // e.g. "en-IN"
}
