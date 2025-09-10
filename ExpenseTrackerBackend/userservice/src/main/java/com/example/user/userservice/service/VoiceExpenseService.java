package com.example.user.userservice.service;

import com.example.user.userservice.dto.VoiceExpenseRequest;
import com.example.user.userservice.dto.VoiceExpenseResponse;

public interface VoiceExpenseService {
    VoiceExpenseResponse processVoiceExpense(VoiceExpenseRequest request);
}
