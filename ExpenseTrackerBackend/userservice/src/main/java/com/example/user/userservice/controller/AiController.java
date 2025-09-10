package com.example.user.userservice.controller;

import com.example.user.userservice.dto.ParseExpenseRequest;
import com.example.user.userservice.dto.ParsedExpenseResponse;
import com.example.user.userservice.service.AiExpenseParserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiExpenseParserService aiExpenseParserService;

    @PostMapping("/parse-expense")
    public ResponseEntity<ParsedExpenseResponse> parseExpense(
            @Valid @RequestBody ParseExpenseRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        
        log.info("Parsing expense for user ID: {} with text: {}", userId, request.getText());
        
        ParsedExpenseResponse response = aiExpenseParserService.parseAndCreateExpense(request, userId);
        
        log.info("Expense parsed and created successfully with ID: {}", response.getExpenseId());
        return ResponseEntity.ok(response);
    }
}
