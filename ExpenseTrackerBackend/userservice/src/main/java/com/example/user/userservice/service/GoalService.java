package com.example.user.userservice.service;

import com.example.user.userservice.dto.GoalRequest;
import com.example.user.userservice.dto.GoalResponse;

import java.util.List;

public interface GoalService {
    
    GoalResponse createGoal(Long userId, GoalRequest request);
    
    GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request);
    
    GoalResponse getGoalById(Long userId, Long goalId);
    
    List<GoalResponse> getAllGoalsByUser(Long userId);
    
    List<GoalResponse> getGoalsByStatus(Long userId, String status);
    
    List<GoalResponse> getGoalsByType(Long userId, String type);
    
    void deleteGoal(Long userId, Long goalId);
    
    GoalResponse updateGoalProgress(Long userId, Long goalId, Double amount);
    
    GoalResponse updateGoalStatus(Long userId, Long goalId, String status);
}


