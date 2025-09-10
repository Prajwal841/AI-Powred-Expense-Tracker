package com.example.user.userservice.controller;

import com.example.user.userservice.dto.BudgetRequest;
import com.example.user.userservice.dto.BudgetResponse;
import com.example.user.userservice.dto.BudgetSummaryResponse;
import com.example.user.userservice.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/budgets")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody BudgetRequest request) {
        
        log.info("Creating budget for user ID: {} with category ID: {} for month: {}", 
                userId, request.getCategoryId(), request.getMonth());
        
        BudgetResponse response = budgetService.createBudget(userId, request);
        
        log.info("Budget created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long budgetId,
            @Valid @RequestBody BudgetRequest request) {
        
        log.info("Updating budget ID: {} for user ID: {}", budgetId, userId);
        
        BudgetResponse response = budgetService.updateBudget(userId, budgetId, request);
        
        log.info("Budget updated successfully with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long budgetId) {
        
        log.debug("Fetching budget ID: {} for user ID: {}", budgetId, userId);
        
        BudgetResponse response = budgetService.getBudgetById(userId, budgetId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(
            @RequestHeader("X-User-Id") Long userId) {
        
        log.debug("Fetching all budgets for user ID: {}", userId);
        
        List<BudgetResponse> responses = budgetService.getAllBudgetsByUser(userId);
        
        log.info("Retrieved {} budgets for user ID: {}", responses.size(), userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/month/{month}")
    public ResponseEntity<List<BudgetResponse>> getBudgetsByMonth(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String month) {
        
        log.debug("Fetching budgets for user ID: {} and month: {}", userId, month);
        
        List<BudgetResponse> responses = budgetService.getBudgetsByUserAndMonth(userId, month);
        
        log.info("Retrieved {} budgets for user ID: {} in month: {}", responses.size(), userId, month);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/summary/{month}")
    public ResponseEntity<BudgetSummaryResponse> getBudgetSummary(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String month) {
        
        log.info("Generating budget summary for user ID: {} and month: {}", userId, month);
        
        BudgetSummaryResponse response = budgetService.getBudgetSummary(userId, month);
        
        log.info("Budget summary generated for user ID: {} in month: {} - Total budget: {}, Total spent: {}, Status: {}", 
                userId, month, response.getTotalBudget(), response.getTotalSpent(), response.getOverallStatus());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long budgetId) {
        
        log.info("Deleting budget ID: {} for user ID: {}", budgetId, userId);
        
        budgetService.deleteBudget(userId, budgetId);
        
        log.info("Budget deleted successfully with ID: {}", budgetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-exists")
    public ResponseEntity<Boolean> checkBudgetExists(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam Long categoryId,
            @RequestParam String month) {
        
        log.debug("Checking if budget exists for user ID: {}, category ID: {}, month: {}", 
                userId, categoryId, month);
        
        boolean exists = budgetService.existsByUserAndCategoryAndMonth(userId, categoryId, month);
        
        return ResponseEntity.ok(exists);
    }
}
