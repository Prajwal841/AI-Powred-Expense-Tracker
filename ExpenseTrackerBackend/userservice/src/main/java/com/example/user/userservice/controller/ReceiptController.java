package com.example.user.userservice.controller;

import com.example.user.userservice.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/{userId}/receipts")
@RequiredArgsConstructor
@Slf4j
public class ReceiptController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getReceipts(@PathVariable Long userId) {
        log.info("Fetching receipts for user ID: {}", userId);
        
        try {
            // Get all expenses with receipts for the user
            List<Map<String, Object>> receipts = expenseService.getReceiptsByUser(userId);
            
            log.info("Retrieved {} receipts for user ID: {}", receipts.size(), userId);
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            log.error("Error fetching receipts for user ID: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createReceipt(@PathVariable Long userId, @RequestBody Map<String, Object> receiptData) {
        log.info("Creating receipt for user ID: {} with data: {}", userId, receiptData);
        
        try {
            // Extract the base64 image data and extracted text
            String imageUrl = (String) receiptData.get("imageUrl");
            String fileName = (String) receiptData.get("fileName");
            Object extractedDataObj = receiptData.get("extractedData");
            
            // Convert extracted data to string if it's an object
            String extractedDataJson = null;
            if (extractedDataObj instanceof Map) {
                extractedDataJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(extractedDataObj);
            } else if (extractedDataObj instanceof String) {
                extractedDataJson = (String) extractedDataObj;
            }
            
            // Create a mock receipt response for the frontend
            Map<String, Object> response = new HashMap<>();
            response.put("id", System.currentTimeMillis()); // Mock ID
            response.put("fileName", fileName);
            response.put("imageUrl", imageUrl);
            response.put("extractedData", extractedDataJson);
            response.put("status", "COMPLETED");
            response.put("createdAt", System.currentTimeMillis());
            response.put("userId", userId);
            
            log.info("Created mock receipt with ID: {} for user: {}", response.get("id"), userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating receipt for user ID: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{receiptId}")
    public ResponseEntity<Map<String, Object>> updateReceipt(@PathVariable Long userId, @PathVariable String receiptId, @RequestBody Map<String, Object> receiptData) {
        log.info("Updating receipt {} for user ID: {} with data: {}", receiptId, userId, receiptData);
        
        try {
            // For now, just return the updated data
            Map<String, Object> response = new HashMap<>();
            response.put("id", receiptId);
            response.put("fileName", receiptData.get("fileName"));
            response.put("imageUrl", receiptData.get("imageUrl"));
            response.put("status", "COMPLETED");
            response.put("createdAt", System.currentTimeMillis());
            response.put("userId", userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating receipt {} for user ID: {}", receiptId, userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{receiptId}")
    public ResponseEntity<Void> deleteReceipt(@PathVariable Long userId, @PathVariable String receiptId) {
        log.info("Deleting receipt {} for user ID: {}", receiptId, userId);
        
        try {
            // For now, just return success since we're not creating separate receipt entities
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting receipt {} for user ID: {}", receiptId, userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugReceipts(@PathVariable Long userId) {
        log.info("Debug receipts for user ID: {}", userId);
        
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("userId", userId);
        debugInfo.put("timestamp", System.currentTimeMillis());
        debugInfo.put("message", "Receipt debug endpoint working");
        debugInfo.put("status", "success");
        
        return ResponseEntity.ok(debugInfo);
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testReceiptCreation(@PathVariable Long userId) {
        log.info("Test receipt creation for user ID: {}", userId);
        
        Map<String, Object> testInfo = new HashMap<>();
        testInfo.put("userId", userId);
        testInfo.put("timestamp", System.currentTimeMillis());
        testInfo.put("message", "Test receipt creation endpoint working");
        testInfo.put("status", "success");
        
        return ResponseEntity.ok(testInfo);
    }

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processReceiptAndCreateExpense(
            @PathVariable Long userId, 
            @RequestBody Map<String, Object> request) {
        
        log.info("Processing receipt and creating expense for user ID: {}", userId);
        
        try {
            // Extract data from request
            String base64Image = (String) request.get("base64Receipt");
            String fileName = (String) request.get("fileName");
            Map<String, Object> expenseData = (Map<String, Object>) request.get("expense");
            
            // Create expense with receipt using the existing expense service
            com.example.user.userservice.dto.ExpenseRequest expenseRequest = new com.example.user.userservice.dto.ExpenseRequest();
            expenseRequest.setName((String) expenseData.get("name"));
            expenseRequest.setAmount((Double) expenseData.get("amount"));
            expenseRequest.setCategoryId((Long) expenseData.get("category"));
            expenseRequest.setDate(java.time.LocalDate.parse((String) expenseData.get("date")));
            expenseRequest.setDescription((String) expenseData.get("description"));
            expenseRequest.setSource("receipt");
            
            // Create expense with base64 receipt
            com.example.user.userservice.dto.ExpenseResponse expenseResponse = 
                expenseService.createExpenseWithBase64Receipt(userId, expenseRequest, base64Image, fileName);
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("expenseId", expenseResponse.getId());
            response.put("message", "Expense created successfully with receipt");
            response.put("receiptPath", expenseResponse.getReceiptPath());
            
            log.info("Successfully created expense with receipt. Expense ID: {}, Receipt path: {}", 
                    expenseResponse.getId(), expenseResponse.getReceiptPath());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing receipt and creating expense for user ID: {}", userId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
