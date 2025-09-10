package com.example.user.userservice.controller;

import com.example.user.userservice.dto.MonthlyBudgetTargetRequest;
import com.example.user.userservice.dto.MonthlyBudgetTargetResponse;
import com.example.user.userservice.service.MonthlyBudgetTargetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user/budget-targets")
@RequiredArgsConstructor
@Slf4j
public class MonthlyBudgetTargetController {

    private final MonthlyBudgetTargetService targetService;

    @PostMapping
    public ResponseEntity<MonthlyBudgetTargetResponse> createOrUpdateTarget(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody MonthlyBudgetTargetRequest request) {
        
        log.info("Creating/updating budget target for user ID: {} for month: {}", userId, request.getMonth());
        
        MonthlyBudgetTargetResponse response = targetService.createOrUpdateTarget(userId, request);
        
        log.info("Budget target saved successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{month}")
    public ResponseEntity<MonthlyBudgetTargetResponse> getTarget(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String month) {
        
        log.info("Fetching budget target for user ID: {} and month: {}", userId, month);
        
        MonthlyBudgetTargetResponse response = targetService.getTargetByUserAndMonth(userId, month);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{month}/active")
    public ResponseEntity<MonthlyBudgetTargetResponse> getActiveTarget(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String month) {
        
        log.info("Fetching active budget target for user ID: {} and month: {}", userId, month);
        
        Optional<MonthlyBudgetTargetResponse> response = targetService.getActiveTargetByUserAndMonth(userId, month);
        
        if (response.isPresent()) {
            return ResponseEntity.ok(response.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{targetId}")
    public ResponseEntity<Void> deleteTarget(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long targetId) {
        
        log.info("Deleting budget target ID: {} for user ID: {}", targetId, userId);
        
        targetService.deleteTarget(userId, targetId);
        
        log.info("Budget target deleted successfully");
        return ResponseEntity.noContent().build();
    }
}
