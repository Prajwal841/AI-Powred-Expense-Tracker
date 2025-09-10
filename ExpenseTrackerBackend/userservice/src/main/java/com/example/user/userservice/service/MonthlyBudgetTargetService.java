package com.example.user.userservice.service;

import com.example.user.userservice.dto.MonthlyBudgetTargetRequest;
import com.example.user.userservice.dto.MonthlyBudgetTargetResponse;

import java.util.Optional;

public interface MonthlyBudgetTargetService {
    
    MonthlyBudgetTargetResponse createOrUpdateTarget(Long userId, MonthlyBudgetTargetRequest request);
    
    MonthlyBudgetTargetResponse getTargetByUserAndMonth(Long userId, String month);
    
    Optional<MonthlyBudgetTargetResponse> getActiveTargetByUserAndMonth(Long userId, String month);
    
    void deleteTarget(Long userId, Long targetId);
}
