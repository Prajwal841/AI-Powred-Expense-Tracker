package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.dto.ExpenseRequest;
import com.example.user.userservice.dto.ExpenseResponse;
import com.example.user.userservice.dto.UserProfileDTO;
import com.example.user.userservice.dto.VoiceExpenseRequest;
import com.example.user.userservice.dto.VoiceExpenseResponse;
import com.example.user.userservice.service.ExpenseService;
import com.example.user.userservice.service.GeminiAIService;
import com.example.user.userservice.service.AuthService;
import com.example.user.userservice.service.VoiceExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoiceExpenseServiceImpl implements VoiceExpenseService {

    private final GeminiAIService geminiAIService;
    private final ExpenseService expenseService;
    private final AuthService authService;

    @Override
    public VoiceExpenseResponse processVoiceExpense(VoiceExpenseRequest request) {
        try {
            log.info("Processing voice expense request for user: {}", request.getUserId());
            
            // Validate user
            UserProfileDTO userProfile = authService.getUserProfile(request.getUserId());
            if (userProfile == null) {
                return VoiceExpenseResponse.builder()
                    .success(false)
                    .message("User not found")
                    .build();
            }
            
            // Parse voice text using Gemini AI
            ExpenseRequest parsedExpense = geminiAIService.parseVoiceToExpense(request.getVoiceText());
            
            log.info("Parsed expense from voice: {}", parsedExpense);
            
            // Create the expense
            ExpenseResponse createdExpense = expenseService.createExpense(request.getUserId(), parsedExpense);
            
            log.info("Created expense from voice: {}", createdExpense);
            
            return VoiceExpenseResponse.builder()
                .success(true)
                .message("Expense created successfully from voice input")
                .expense(createdExpense)
                .parsedText(request.getVoiceText())
                .confidence("High")
                .build();
                
        } catch (Exception e) {
            log.error("Error processing voice expense: {}", e.getMessage(), e);
            return VoiceExpenseResponse.builder()
                .success(false)
                .message("Failed to process voice expense: " + e.getMessage())
                .parsedText(request.getVoiceText())
                .confidence("Low")
                .build();
        }
    }
}
