package com.example.user.userservice.service;

import com.example.user.userservice.dto.ParseExpenseRequest;
import com.example.user.userservice.dto.ParsedExpenseResponse;
import com.example.user.userservice.entity.Category;
import com.example.user.userservice.entity.Expense;
import com.example.user.userservice.entity.User;
import com.example.user.userservice.exception.ExpenseException;
import com.example.user.userservice.repository.CategoryRepository;
import com.example.user.userservice.repository.ExpenseRepository;
import com.example.user.userservice.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiExpenseParserService {

    private final WebClient hfWebClient;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${hf.model}")
    private String modelId;

    private static final String SYSTEM_PROMPT = """
            You are an expense parser. 
            Return *only* valid JSON for each request. No extra text.

            Goal: extract a single expense from a short sentence.
            Output JSON with keys:
            {
              "amount": number,
              "currency": "INR",
              "date": "YYYY-MM-DD",        // normalized using the provided timezone
              "category": string,          // choose from the allowed list only
              "subcategory": string|null,
              "description": string|null,
              "merchant": string|null,
              "confidence": number         // 0..1 rough confidence in your extraction
            }

            Rules:
            - If amount has "rs", "rupees", assume INR. Amount must be a number (no commas or currency symbol).
            - Date: Resolve relative terms like "today", "yesterday", "last Friday" with the provided timezone.
                                - Category MUST be one of:
                      ["Food & Dining","Transportation","Housing & Utilities","Health & Fitness","Shopping","Entertainment","Travel","Education","Savings & Investments","Debt & Loans","Personal Care","Others"]
                    - If unsure, use "Others" and lower the confidence.
            - Subcategory is optional (e.g., "Sandwich").
            - Merchant is optional (e.g., "Subway", "Starbucks") if obvious.
            - Description: short human-friendly summary.

            Return JSON only. No markdown, no backticks.
            """;

    public ParsedExpenseResponse parseAndCreateExpense(ParseExpenseRequest request, Long userId) {
        try {
            // Validate user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));

            // Try AI parsing first
            ParsedFromAi parsed = parseWithAI(request);
            
            // Validate and normalize
            LocalDate date = ensureIsoDate(parsed.date(), request.getTimezone());
            double amount = ensurePositive(parsed.amount());
            
            // Map category to existing categories
            Category category = mapToKnownCategory(parsed.category());
            
            // Create and save expense
            Expense expense = Expense.builder()
                    .user(user)
                    .name(Optional.ofNullable(parsed.description()).orElseGet(() -> defaultNameFromText(request.getText())))
                    .category(category)
                    .description(parsed.description())
                    .amount(amount)
                    .date(date)
                    .source("AI")
                    .build();
            
            Expense savedExpense = expenseRepository.save(expense);
            
            return ParsedExpenseResponse.builder()
                    .expenseId(savedExpense.getId())
                    .name(savedExpense.getName())
                    .category(savedExpense.getCategory().getName())
                    .subcategory(parsed.subcategory())
                    .amount(savedExpense.getAmount())
                    .currency("INR")
                    .date(savedExpense.getDate())
                    .description(savedExpense.getDescription())
                    .merchant(parsed.merchant())
                    .confidence(Math.max(0, Math.min(1, parsed.confidence())))
                    .source("AI")
                    .build();
                    
        } catch (WebClientResponseException e) {
            log.warn("AI parsing failed, falling back to regex: {}", e.getMessage());
            return fallbackToRegex(request, userId);
        } catch (Exception e) {
            log.error("Error in AI expense parsing", e);
            return fallbackToRegex(request, userId);
        }
    }

    private ParsedFromAi parseWithAI(ParseExpenseRequest request) {
        var body = Map.of(
                "model", modelId,
                "stream", false,
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", userPayload(request))
                )
        );

        String content = hfWebClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(json -> json.path("choices").get(0).path("message").path("content").asText())
                .block();

        // Defensive: extract the first JSON object from the content
        String jsonOnly = extractJson(content);
        
        try {
            return objectMapper.readValue(jsonOnly, ParsedFromAi.class);
        } catch (Exception e) {
            log.error("Failed to parse AI response as JSON: {}", content);
            throw new RuntimeException("Invalid AI response format", e);
        }
    }

    private ParsedExpenseResponse fallbackToRegex(ParseExpenseRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));

        // Simple regex fallback
        Pattern amountPattern = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:rs|inr|rupees)?", Pattern.CASE_INSENSITIVE);
        Matcher matcher = amountPattern.matcher(request.getText());
        
        if (!matcher.find()) {
            throw new ExpenseException("Could not extract amount from text");
        }
        
        double amount = Double.parseDouble(matcher.group(1));
        LocalDate date = LocalDate.now(ZoneId.of(request.getTimezone()));
        
        Category defaultCategory = categoryRepository.findByName("Others")
                .orElseThrow(() -> new RuntimeException("Default category 'Others' not found"));
        
        Expense expense = Expense.builder()
                .user(user)
                .name(defaultNameFromText(request.getText()))
                .category(defaultCategory)
                .description(request.getText())
                .amount(amount)
                .date(date)
                .source("AI_FALLBACK")
                .build();
        
        Expense savedExpense = expenseRepository.save(expense);
        
        return ParsedExpenseResponse.builder()
                .expenseId(savedExpense.getId())
                .name(savedExpense.getName())
                .category(savedExpense.getCategory().getName())
                .subcategory(null)
                .amount(savedExpense.getAmount())
                .currency("INR")
                .date(savedExpense.getDate())
                .description(savedExpense.getDescription())
                .merchant(null)
                .confidence(0.3) // Low confidence for fallback
                .source("AI_FALLBACK")
                .build();
    }

    private String userPayload(ParseExpenseRequest request) {
        return String.format("""
                Timezone: %s
                Currency: %s
                Locale: %s

                Text: "%s"
                """, request.getTimezone(), request.getCurrency(), request.getLocale(), request.getText());
    }

    private String extractJson(String content) {
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end >= start) {
            return content.substring(start, end + 1);
        }
        throw new IllegalArgumentException("AI did not return JSON");
    }

    private LocalDate ensureIsoDate(String dateStr, String timezone) {
        ZoneId zone = ZoneId.of(Optional.ofNullable(timezone).orElse("Asia/Kolkata"));
        
        if ("today".equalsIgnoreCase(dateStr)) {
            return LocalDate.now(zone);
        }
        if ("yesterday".equalsIgnoreCase(dateStr)) {
            return LocalDate.now(zone).minusDays(1);
        }
        
        try {
            return LocalDate.parse(dateStr); // expect YYYY-MM-DD
        } catch (Exception e) {
            log.warn("Invalid date format: {}, using today", dateStr);
            return LocalDate.now(zone);
        }
    }

    private double ensurePositive(Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount missing or invalid");
        }
        return amount;
    }

    private Category mapToKnownCategory(String aiCategory) {
        if (aiCategory == null) {
            return categoryRepository.findByName("Others")
                    .orElseThrow(() -> new RuntimeException("Default category 'Others' not found"));
        }
        
        // Try exact match first, then case-insensitive search
        return categoryRepository.findByName(aiCategory)
                .orElseGet(() -> categoryRepository.findByName(aiCategory.toLowerCase())
                        .orElseGet(() -> categoryRepository.findByName("Others")
                                .orElseThrow(() -> new RuntimeException("Default category 'Others' not found"))));
    }

    private String defaultNameFromText(String text) {
        return text.length() > 60 ? text.substring(0, 60) : text;
    }

    // DTO matching AI JSON response
    public record ParsedFromAi(
            Double amount,
            String currency,
            String date,
            String category,
            String subcategory,
            String description,
            String merchant,
            Double confidence
    ) {}
}
