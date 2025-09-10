package com.example.user.userservice.service;

import com.example.user.userservice.dto.ExpenseRequest;

public interface GeminiAIService {
    ExpenseRequest parseVoiceToExpense(String voiceText);
}
