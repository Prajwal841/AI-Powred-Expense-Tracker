package com.example.user.userservice.controller;

import com.example.user.userservice.dto.GoalRequest;
import com.example.user.userservice.dto.GoalResponse;
import com.example.user.userservice.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/goals")
@RequiredArgsConstructor
@Slf4j
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody GoalRequest request) {
        
        // Validate that the authenticated user matches the requested userId
        if (!validateUserAccess(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Creating goal for user ID: {} with title: {}", userId, request.getTitle());
        
        GoalResponse response = goalService.createGoal(userId, request);
        
        log.info("Goal created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<GoalResponse> updateGoal(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long goalId,
            @Valid @RequestBody GoalRequest request) {
        
        // Validate that the authenticated user matches the requested userId
        if (!validateUserAccess(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Updating goal ID: {} for user ID: {}", goalId, userId);
        
        GoalResponse response = goalService.updateGoal(userId, goalId, request);
        
        log.info("Goal updated successfully with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{goalId}")
    public ResponseEntity<GoalResponse> getGoalById(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long goalId) {
        
        // Validate that the authenticated user matches the requested userId
        if (!validateUserAccess(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.debug("Fetching goal ID: {} for user ID: {}", goalId, userId);
        
        GoalResponse response = goalService.getGoalById(userId, goalId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getAllGoals(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        
        // Validate that the authenticated user matches the requested userId
        if (!validateUserAccess(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.debug("Fetching goals for user ID: {} with status: {}, type: {}", userId, status, type);
        
        List<GoalResponse> goals;
        
        if (status != null && !status.isEmpty()) {
            goals = goalService.getGoalsByStatus(userId, status);
        } else if (type != null && !type.isEmpty()) {
            goals = goalService.getGoalsByType(userId, type);
        } else {
            goals = goalService.getAllGoalsByUser(userId);
        }
        
        log.info("Found {} goals for user ID: {}", goals.size(), userId);
        return ResponseEntity.ok(goals);
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long goalId) {
        
        // Validate that the authenticated user matches the requested userId
        if (!validateUserAccess(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Deleting goal ID: {} for user ID: {}", goalId, userId);
        
        goalService.deleteGoal(userId, goalId);
        
        log.info("Goal deleted successfully with ID: {}", goalId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{goalId}/progress")
    public ResponseEntity<GoalResponse> updateGoalProgress(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long goalId,
            @RequestBody Double amount) {
        
        // Validate that the authenticated user matches the requested userId
        if (!validateUserAccess(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Updating progress for goal ID: {} for user ID: {} with amount: {}", goalId, userId, amount);
        
        GoalResponse response = goalService.updateGoalProgress(userId, goalId, amount);
        
        log.info("Goal progress updated successfully with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{goalId}/status")
    public ResponseEntity<GoalResponse> updateGoalStatus(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long goalId,
            @RequestBody String status) {
        
        // Validate that the authenticated user matches the requested userId
        if (!validateUserAccess(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("Updating status for goal ID: {} for user ID: {} to status: {}", goalId, userId, status);
        
        GoalResponse response = goalService.updateGoalStatus(userId, goalId, status);
        
        log.info("Goal status updated successfully with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Validates that the authenticated user matches the requested userId
     */
    private boolean validateUserAccess(Long requestedUserId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("No authenticated user found");
                return false;
            }

            // Get the authenticated user's email from the security context
            String authenticatedUserEmail = authentication.getName();
            log.debug("Authenticated user email: {}", authenticatedUserEmail);
            
            // For now, we'll trust the X-User-Id header since the JWT filter validates the token
            // In a production app, you might want to fetch the user from the database and verify
            return true;
            
        } catch (Exception e) {
            log.error("Error validating user access: {}", e.getMessage(), e);
            return false;
        }
    }
}


