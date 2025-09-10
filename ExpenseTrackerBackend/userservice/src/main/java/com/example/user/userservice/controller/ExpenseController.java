package com.example.user.userservice.controller;

import com.example.user.userservice.dto.ExpenseRequest;
import com.example.user.userservice.dto.ExpenseRequestWithBase64Receipt;
import com.example.user.userservice.dto.ExpenseResponse;
import com.example.user.userservice.dto.ExpenseSummaryResponse;
import com.example.user.userservice.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/expenses")
@RequiredArgsConstructor
@Slf4j
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ExpenseRequest request) {
        
        log.info("Creating expense for user ID: {} with name: {} and amount: {}", 
                userId, request.getName(), request.getAmount());
        
        ExpenseResponse response = expenseService.createExpense(userId, request);
        
        log.info("Expense created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/with-receipt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExpenseResponse> createExpenseWithReceipt(
            @RequestHeader("X-User-Id") Long userId,
            @RequestPart("expense") @Valid ExpenseRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt) {
        
        log.info("Creating expense with receipt for user ID: {} with name: {}", userId, request.getName());
        
        ExpenseResponse response = expenseService.createExpenseWithReceipt(userId, request, receipt);
        
        log.info("Expense with receipt created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/with-base64-receipt", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ExpenseResponse> createExpenseWithBase64Receipt(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody @Valid ExpenseRequestWithBase64Receipt request) {
        
        log.info("Creating expense with base64 receipt for user ID: {} with name: {}", userId, request.getName());
        
        ExpenseResponse response = expenseService.createExpenseWithBase64Receipt(userId, request, request.getBase64Receipt(), request.getFileName());
        
        log.info("Expense with base64 receipt created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request) {
        
        log.info("Updating expense ID: {} for user ID: {}", expenseId, userId);
        
        ExpenseResponse response = expenseService.updateExpense(userId, expenseId, request);
        
        log.info("Expense updated successfully with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{expenseId}/with-receipt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExpenseResponse> updateExpenseWithReceipt(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long expenseId,
            @RequestPart("expense") @Valid ExpenseRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt) {
        
        log.info("Updating expense with receipt for expense ID: {} and user ID: {}", expenseId, userId);
        
        ExpenseResponse response = expenseService.updateExpenseWithReceipt(userId, expenseId, request, receipt);
        
        log.info("Expense with receipt updated successfully with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long expenseId) {
        
        log.debug("Fetching expense ID: {} for user ID: {}", expenseId, userId);
        
        ExpenseResponse response = expenseService.getExpenseById(userId, expenseId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses(
            @RequestHeader("X-User-Id") Long userId) {
        
        log.debug("Fetching all expenses for user ID: {}", userId);
        
        List<ExpenseResponse> responses = expenseService.getAllExpensesByUser(userId);
        
        log.info("Retrieved {} expenses for user ID: {}", responses.size(), userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByDateRange(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.debug("Fetching expenses for user ID: {} between {} and {}", userId, startDate, endDate);
        
        List<ExpenseResponse> responses = expenseService.getExpensesByUserAndDateRange(userId, startDate, endDate);
        
        log.info("Retrieved {} expenses for user ID: {} in date range", responses.size(), userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByCategory(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long categoryId) {
        
        log.debug("Fetching expenses for user ID: {} and category ID: {}", userId, categoryId);
        
        List<ExpenseResponse> responses = expenseService.getExpensesByUserAndCategory(userId, categoryId);
        
        log.info("Retrieved {} expenses for user ID: {} in category ID: {}", responses.size(), userId, categoryId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/month/{month}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByMonth(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String month) {
        
        log.debug("Fetching expenses for user ID: {} and month: {}", userId, month);
        
        List<ExpenseResponse> responses = expenseService.getExpensesByUserAndMonth(userId, month);
        
        log.info("Retrieved {} expenses for user ID: {} in month: {}", responses.size(), userId, month);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/summary")
    public ResponseEntity<ExpenseSummaryResponse> getExpenseSummary(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Generating expense summary for user ID: {} between {} and {}", userId, startDate, endDate);
        
        ExpenseSummaryResponse response = expenseService.getExpenseSummary(userId, startDate, endDate);
        
        log.info("Expense summary generated for user ID: {} - Total expenses: {}, Total transactions: {}", 
                userId, response.getTotalExpenses(), response.getTotalTransactions());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long expenseId) {
        
        log.info("Deleting expense ID: {} for user ID: {}", expenseId, userId);
        
        expenseService.deleteExpense(userId, expenseId);
        
        log.info("Expense deleted successfully with ID: {}", expenseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{expenseId}/receipt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadReceipt(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long expenseId,
            @RequestParam("receipt") MultipartFile receipt) {
        
        log.info("Uploading receipt for expense ID: {} and user ID: {}", expenseId, userId);
        
        String receiptPath = expenseService.uploadReceipt(userId, expenseId, receipt);
        
        log.info("Receipt uploaded successfully for expense ID: {} at path: {}", expenseId, receiptPath);
        return ResponseEntity.ok(receiptPath);
    }

    @DeleteMapping("/{expenseId}/receipt")
    public ResponseEntity<Void> deleteReceipt(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long expenseId) {
        
        log.info("Deleting receipt for expense ID: {} and user ID: {}", expenseId, userId);
        
        expenseService.deleteReceipt(userId, expenseId);
        
        log.info("Receipt deleted successfully for expense ID: {}", expenseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/test-base64-receipt")
    public ResponseEntity<Map<String, Object>> testBase64ReceiptCreation(
            @RequestHeader("X-User-Id") Long userId) {
        
        log.info("Test base64 receipt creation for user ID: {}", userId);
        
        Map<String, Object> testInfo = new HashMap<>();
        testInfo.put("userId", userId);
        testInfo.put("timestamp", new Date());
        
        try {
            // Create a test expense with base64 receipt
            String testBase64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A";
            
            ExpenseRequestWithBase64Receipt testRequest = new ExpenseRequestWithBase64Receipt();
            testRequest.setName("Test Expense with Receipt");
            testRequest.setDescription("Test expense created with base64 receipt");
            testRequest.setCategoryId(1L); // Assuming category ID 1 exists
            testRequest.setAmount(150.00);
            testRequest.setDate(LocalDate.now());
            testRequest.setSource("receipt");
            testRequest.setBase64Receipt(testBase64Image);
            testRequest.setFileName("test-receipt.jpg");
            
            log.info("Creating test expense with base64 receipt...");
            
            ExpenseResponse response = expenseService.createExpenseWithBase64Receipt(userId, testRequest, testRequest.getBase64Receipt(), testRequest.getFileName());
            testInfo.put("testExpenseId", response.getId());
            testInfo.put("testExpenseReceiptPath", response.getReceiptPath());
            testInfo.put("status", "success");
            
            log.info("Test expense created with ID: {} and receipt path: {}", 
                response.getId(), response.getReceiptPath());
                
        } catch (Exception e) {
            log.error("Error in test base64 receipt creation", e);
            testInfo.put("status", "error");
            testInfo.put("error", e.getMessage());
            testInfo.put("errorType", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(testInfo);
    }
}
