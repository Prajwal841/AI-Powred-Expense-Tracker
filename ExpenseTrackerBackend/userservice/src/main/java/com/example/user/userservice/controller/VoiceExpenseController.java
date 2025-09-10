package com.example.user.userservice.controller;

import com.example.user.userservice.dto.VoiceExpenseRequest;
import com.example.user.userservice.dto.VoiceExpenseResponse;
import com.example.user.userservice.service.VoiceExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/voice-expense")
@RequiredArgsConstructor
@Slf4j
public class VoiceExpenseController {

    private final VoiceExpenseService voiceExpenseService;

    @PostMapping("/process")
    public ResponseEntity<VoiceExpenseResponse> processVoiceExpense(
            @RequestBody VoiceExpenseRequest request,
            @RequestHeader("X-User-Id") String userId) {
        
        try {
            log.info("Received voice expense request for user: {}", userId);
            
            // Set the user ID from header
            request.setUserId(Long.parseLong(userId));
            
            // Process the voice expense
            VoiceExpenseResponse response = voiceExpenseService.processVoiceExpense(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error processing voice expense: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(VoiceExpenseResponse.builder()
                    .success(false)
                    .message("Internal server error: " + e.getMessage())
                    .build());
        }
    }

    @PostMapping("/test")
    public ResponseEntity<VoiceExpenseResponse> testVoiceExpense(
            @RequestBody VoiceExpenseRequest request,
            @RequestHeader("X-User-Id") String userId) {
        
        try {
            log.info("Testing voice expense processing for user: {}", userId);
            
            // Set the user ID from header
            request.setUserId(Long.parseLong(userId));
            
            // Process the voice expense
            VoiceExpenseResponse response = voiceExpenseService.processVoiceExpense(request);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error testing voice expense: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(VoiceExpenseResponse.builder()
                    .success(false)
                    .message("Test failed: " + e.getMessage())
                    .build());
        }
    }
}
