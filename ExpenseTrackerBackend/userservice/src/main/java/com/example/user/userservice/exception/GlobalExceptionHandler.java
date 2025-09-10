package com.example.user.userservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Handle validation errors (from @Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );

        log.warn("Validation failed: {}", errors);
        return ResponseEntity.badRequest().body(errors);
    }

    // Handle custom exceptions
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<Map<String, String>> handleCustomException(CustomException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());

        log.warn("CustomException thrown: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handle budget exceptions
    @ExceptionHandler(BudgetException.class)
    public ResponseEntity<Map<String, String>> handleBudgetException(BudgetException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());

        log.warn("BudgetException thrown: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handle category exceptions
    @ExceptionHandler(CategoryException.class)
    public ResponseEntity<Map<String, String>> handleCategoryException(CategoryException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());

        log.warn("CategoryException thrown: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handle expense exceptions
    @ExceptionHandler(ExpenseException.class)
    public ResponseEntity<Map<String, String>> handleExpenseException(ExpenseException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());

        log.warn("ExpenseException thrown: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handle file storage exceptions
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<Map<String, String>> handleFileStorageException(FileStorageException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());

        log.warn("FileStorageException thrown: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }



    // Handle goal exceptions
    @ExceptionHandler(GoalException.class)
    public ResponseEntity<Map<String, String>> handleGoalException(GoalException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());

        log.warn("GoalException thrown: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Catch all fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllUnhandled(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Something went wrong");

        log.error("Unhandled exception occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
