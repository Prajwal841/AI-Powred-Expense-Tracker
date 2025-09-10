package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.dto.ExpenseRequest;
import com.example.user.userservice.service.GeminiAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class GeminiAIServiceImpl implements GeminiAIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model.name}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ExpenseRequest parseVoiceToExpense(String voiceText) {
        try {
            log.info("Parsing voice text: {}", voiceText);
            
            // Create prompt for expense parsing
            String prompt = createExpenseParsingPrompt(voiceText);
            
            // Call Gemini API using HTTP
            String aiResponse = callGeminiAPI(prompt);
            
            log.info("Gemini AI Response: {}", aiResponse);
            
            // Parse the AI response into ExpenseRequest
            ExpenseRequest expenseRequest = parseAIResponse(aiResponse, voiceText);
            
            log.info("Parsed expense request: {}", expenseRequest);
            return expenseRequest;
            
        } catch (Exception e) {
            log.error("Error parsing voice text with Gemini AI: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to parse voice text", e);
        }
    }

    private String callGeminiAPI(String prompt) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            content.put("parts", new Object[]{
                Map.of("text", prompt)
            });
            requestBody.put("contents", new Object[]{content});
            
            String requestJson = objectMapper.writeValueAsString(requestBody);
            log.info("Gemini API Request: {}", requestJson);
            
            String response = restTemplate.postForObject(url, requestJson, String.class);
            log.info("Gemini API Raw Response: {}", response);
            
            if (response != null) {
                JsonNode responseNode = objectMapper.readTree(response);
                if (responseNode.has("candidates") && responseNode.get("candidates").isArray() && responseNode.get("candidates").size() > 0) {
                    JsonNode candidate = responseNode.get("candidates").get(0);
                    if (candidate.has("content") && candidate.get("content").has("parts")) {
                        JsonNode parts = candidate.get("content").get("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            return parts.get(0).get("text").asText();
                        }
                    }
                }
            }
            
            throw new RuntimeException("Invalid response from Gemini API");
            
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call Gemini API", e);
        }
    }

    private String createExpenseParsingPrompt(String voiceText) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate lastWeek = today.minusDays(7);
        
        return String.format("""
            You are an intelligent expense parsing assistant. Parse the following voice input into a structured expense format with high accuracy.
            
            CURRENT DATE CONTEXT:
            - Today's date is: %s
            - Yesterday's date is: %s
            - Last week's date is: %s
            
            Voice Input: "%s"
            
            CATEGORY MAPPING (be very specific):
            - 1 (Food & Dining): restaurants, cafes, food delivery, groceries, dining out, lunch, dinner, breakfast, snacks, food items
            - 2 (Transportation): fuel, gas, petrol, diesel, taxi, uber, bus, train, metro, parking, toll, car maintenance, bike, scooter
            - 3 (Shopping): clothes, electronics, gadgets, accessories, fashion, retail stores, online shopping, malls, department stores
            - 4 (Entertainment): movies, cinema, games, streaming services, Netflix, Amazon Prime, sports events, concerts, shows, amusement parks
            - 5 (Healthcare): medicines, doctor visits, hospital, medical tests, pharmacy, health insurance, dental, optical, fitness
            - 6 (Education): books, courses, tuition, school fees, college fees, training, workshops, online courses, educational materials
            - 7 (Utilities): electricity, water, gas, internet, phone bills, mobile recharge, broadband, cable TV, maintenance
            - 8 (Travel): flights, hotels, vacation, holiday, travel packages, tourism, sightseeing, accommodation
            - 9 (Business): office supplies, business meetings, client expenses, work-related travel, professional services
            - 10 (Other): anything that doesn't fit above categories
            
            DATE PARSING RULES (CRITICAL - USE CURRENT DATE CONTEXT ABOVE):
            - "yesterday" = %s
            - "today" = %s
            - "last week" = %s
            - "last month" = %s (approximately)
            - "Monday", "Tuesday", etc. = most recent occurrence of that day
            - "last Monday" = previous Monday from today
            - "this week" = within last 7 days from today
            - "this month" = within current month
            - If no date mentioned, use today's date: %s
            
            Extract and return in this exact JSON format:
            {
                "name": "clear expense name",
                "amount": 0.0,
                "categoryId": 1,
                "date": "YYYY-MM-DD",
                "description": "detailed description"
            }
            
            EXAMPLES WITH CURRENT DATES:
            Input: "I spent 500 rupees on lunch yesterday at McDonald's"
            Output: {"name": "Lunch at McDonald's", "amount": 500.0, "categoryId": 1, "date": "%s", "description": "Lunch at McDonald's restaurant"}
            
            Input: "Bought petrol for 2000 rupees today"
            Output: {"name": "Petrol", "amount": 2000.0, "categoryId": 2, "date": "%s", "description": "Fuel purchase for vehicle"}
            
            Input: "Paid 1500 for movie tickets last week"
            Output: {"name": "Movie Tickets", "amount": 1500.0, "categoryId": 4, "date": "%s", "description": "Cinema tickets for entertainment"}
            
            CRITICAL RULES:
            1. ALWAYS use the current date context provided above
            2. Be very specific with category mapping based on the examples above
            3. Parse dates accurately using the date rules and current date context
            4. Extract amounts carefully (look for numbers followed by currency words)
            5. Create descriptive names that clearly identify the expense
            6. Only return valid JSON, no additional text or explanations
            7. NEVER use hardcoded years like 2023 or 2024 - always calculate from the current date context
            """, 
            today.toString(), yesterday.toString(), lastWeek.toString(), // Current date context
            voiceText, // Voice input
            yesterday.toString(), today.toString(), lastWeek.toString(), today.minusMonths(1).toString(), today.toString(), // Date parsing rules
            yesterday.toString(), today.toString(), lastWeek.toString() // Examples
        );
    }

    private ExpenseRequest parseAIResponse(String aiResponse, String originalVoiceText) {
        try {
            log.info("Raw AI response: {}", aiResponse);
            
            // Clean the response to extract JSON
            String jsonResponse = extractJsonFromResponse(aiResponse);
            log.info("Extracted JSON: {}", jsonResponse);
            
            // Parse JSON using simple regex (for simplicity, you could use Jackson)
            ExpenseRequest expenseRequest = new ExpenseRequest();
            
            // Extract name
            Pattern namePattern = Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"");
            Matcher nameMatcher = namePattern.matcher(jsonResponse);
            if (nameMatcher.find()) {
                String name = nameMatcher.group(1).trim();
                if (!name.isEmpty()) {
                    expenseRequest.setName(name);
                } else {
                    log.warn("Empty name found. Using default name");
                    expenseRequest.setName("Voice Expense");
                }
            }
            
            // Extract amount
            Pattern amountPattern = Pattern.compile("\"amount\"\\s*:\\s*(\\d+\\.?\\d*)");
            Matcher amountMatcher = amountPattern.matcher(jsonResponse);
            if (amountMatcher.find()) {
                try {
                    String amountStr = amountMatcher.group(1);
                    expenseRequest.setAmount(Double.parseDouble(amountStr));
                } catch (Exception e) {
                    log.warn("Failed to parse amount. Using 0.0");
                    expenseRequest.setAmount(0.0);
                }
            }
            
            // Extract categoryId
            Pattern categoryPattern = Pattern.compile("\"categoryId\"\\s*:\\s*(\\d+)");
            Matcher categoryMatcher = categoryPattern.matcher(jsonResponse);
            if (categoryMatcher.find()) {
                try {
                    String categoryIdStr = categoryMatcher.group(1);
                    long categoryId = Long.parseLong(categoryIdStr);
                    // Validate category ID is within range
                    if (categoryId >= 1 && categoryId <= 10) {
                        expenseRequest.setCategoryId(categoryId);
                    } else {
                        log.warn("Invalid category ID: {}. Using default (10)", categoryId);
                        expenseRequest.setCategoryId(10L);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse category ID. Using default (10)");
                    expenseRequest.setCategoryId(10L);
                }
            }
            
            // Extract date
            Pattern datePattern = Pattern.compile("\"date\"\\s*:\\s*\"([^\"]+)\"");
            Matcher dateMatcher = datePattern.matcher(jsonResponse);
            if (dateMatcher.find()) {
                String dateStr = dateMatcher.group(1);
                LocalDate finalDate = parseAndValidateDate(dateStr, originalVoiceText);
                expenseRequest.setDate(finalDate);
                log.info("Final parsed date: {}", finalDate);
            } else {
                // Use today's date if not found
                expenseRequest.setDate(LocalDate.now());
                log.info("No date found in AI response. Using today's date");
            }
            
            // Extract description
            Pattern descPattern = Pattern.compile("\"description\"\\s*:\\s*\"([^\"]*)\"");
            Matcher descMatcher = descPattern.matcher(jsonResponse);
            if (descMatcher.find()) {
                String description = descMatcher.group(1).trim();
                if (!description.isEmpty()) {
                    expenseRequest.setDescription(description);
                } else {
                    expenseRequest.setDescription("Expense from voice input");
                }
            }
            

            
            // Validate and set defaults if needed
            validateAndSetDefaults(expenseRequest);
            
            log.info("Successfully parsed expense: name={}, amount={}, categoryId={}, date={}", 
                expenseRequest.getName(), expenseRequest.getAmount(), 
                expenseRequest.getCategoryId(), expenseRequest.getDate());
            
            return expenseRequest;
            
        } catch (Exception e) {
            log.error("Error parsing AI response: {}", e.getMessage(), e);
            // Return default expense request
            ExpenseRequest defaultRequest = new ExpenseRequest();
            defaultRequest.setName("Voice Expense");
            defaultRequest.setAmount(0.0);
            defaultRequest.setCategoryId(10L); // Default to "Other" category
            defaultRequest.setDate(LocalDate.now());
            defaultRequest.setDescription("Failed to parse voice input");
            return defaultRequest;
        }
    }

    private String extractJsonFromResponse(String response) {
        try {
            // First, try to find a complete JSON object
            Pattern jsonPattern = Pattern.compile("\\{[^}]*\"name\"[^}]*\"amount\"[^}]*\"categoryId\"[^}]*\"date\"[^}]*\"description\"[^}]*\\}");
            Matcher matcher = jsonPattern.matcher(response);
            if (matcher.find()) {
                return matcher.group(0);
            }
            
            // If not found, try to find any JSON object
            Pattern simpleJsonPattern = Pattern.compile("\\{[^}]*\\}");
            Matcher simpleMatcher = simpleJsonPattern.matcher(response);
            if (simpleMatcher.find()) {
                return simpleMatcher.group(0);
            }
            
            log.warn("No JSON object found in response: {}", response);
            return response;
        } catch (Exception e) {
            log.error("Error extracting JSON from response: {}", e.getMessage());
            return response;
        }
    }

    private LocalDate parseAndValidateDate(String dateStr, String originalVoiceText) {
        LocalDate today = LocalDate.now();
        
        try {
            // First try to parse as ISO date
            LocalDate parsedDate = LocalDate.parse(dateStr);
            
            // Validate date is reasonable
            LocalDate oneYearAgo = today.minusYears(1);
            LocalDate tomorrow = today.plusDays(1);
            
            if (parsedDate.isAfter(tomorrow)) {
                log.warn("Parsed date {} is in the future. Checking voice text for relative date terms", dateStr);
                return parseRelativeDateFromVoiceText(originalVoiceText);
            } else if (parsedDate.isBefore(oneYearAgo)) {
                log.warn("Parsed date {} is more than a year ago. Checking voice text for relative date terms", dateStr);
                return parseRelativeDateFromVoiceText(originalVoiceText);
            } else {
                log.info("Successfully parsed and validated date: {}", parsedDate);
                return parsedDate;
            }
        } catch (Exception e) {
            log.warn("Failed to parse date: {}. Checking voice text for relative date terms", dateStr);
            return parseRelativeDateFromVoiceText(originalVoiceText);
        }
    }
    
    private LocalDate parseRelativeDateFromVoiceText(String voiceText) {
        LocalDate today = LocalDate.now();
        String lowerVoiceText = voiceText.toLowerCase();
        
        log.info("Parsing relative date from voice text: {}", voiceText);
        
        // Check for specific relative date terms
        if (lowerVoiceText.contains("yesterday")) {
            LocalDate yesterday = today.minusDays(1);
            log.info("Found 'yesterday' in voice text. Using date: {}", yesterday);
            return yesterday;
        } else if (lowerVoiceText.contains("today") || lowerVoiceText.contains("now")) {
            log.info("Found 'today/now' in voice text. Using date: {}", today);
            return today;
        } else if (lowerVoiceText.contains("last week")) {
            LocalDate lastWeek = today.minusWeeks(1);
            log.info("Found 'last week' in voice text. Using date: {}", lastWeek);
            return lastWeek;
        } else if (lowerVoiceText.contains("last month")) {
            LocalDate lastMonth = today.minusMonths(1);
            log.info("Found 'last month' in voice text. Using date: {}", lastMonth);
            return lastMonth;
        } else if (lowerVoiceText.contains("this week")) {
            // Use 3 days ago as a reasonable "this week" date
            LocalDate thisWeek = today.minusDays(3);
            log.info("Found 'this week' in voice text. Using date: {}", thisWeek);
            return thisWeek;
        } else if (lowerVoiceText.contains("this month")) {
            // Use 10 days ago as a reasonable "this month" date
            LocalDate thisMonth = today.minusDays(10);
            log.info("Found 'this month' in voice text. Using date: {}", thisMonth);
            return thisMonth;
        }
        
        // Check for specific day names
        String[] dayNames = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"};
        for (int i = 0; i < dayNames.length; i++) {
            if (lowerVoiceText.contains(dayNames[i])) {
                LocalDate dayDate = getMostRecentDayOfWeek(today, i + 1); // Monday = 1, Sunday = 7
                log.info("Found '{}' in voice text. Using most recent occurrence: {}", dayNames[i], dayDate);
                return dayDate;
            }
        }
        
        // Default to today if no relative date terms found
        log.info("No relative date terms found. Using today's date: {}", today);
        return today;
    }
    
    private LocalDate getMostRecentDayOfWeek(LocalDate today, int targetDayOfWeek) {
        int currentDayOfWeek = today.getDayOfWeek().getValue();
        int daysBack = currentDayOfWeek - targetDayOfWeek;
        
        if (daysBack <= 0) {
            // Target day is in the future this week, so get it from last week
            daysBack += 7;
        }
        
        return today.minusDays(daysBack);
    }

    private void validateAndSetDefaults(ExpenseRequest expenseRequest) {
        // Validate name
        if (expenseRequest.getName() == null || expenseRequest.getName().trim().isEmpty()) {
            expenseRequest.setName("Voice Expense");
            log.warn("Setting default name: Voice Expense");
        }

        // Validate amount
        if (expenseRequest.getAmount() == null || expenseRequest.getAmount() < 0) {
            expenseRequest.setAmount(0.0);
            log.warn("Setting default amount: 0.0");
        }

        // Validate categoryId
        if (expenseRequest.getCategoryId() == null || 
            expenseRequest.getCategoryId() < 1 || 
            expenseRequest.getCategoryId() > 10) {
            expenseRequest.setCategoryId(10L);
            log.warn("Setting default categoryId: 10 (Other)");
        }

        // Validate date
        if (expenseRequest.getDate() == null) {
            expenseRequest.setDate(LocalDate.now());
            log.warn("Setting default date: today");
        }

        // Validate description
        if (expenseRequest.getDescription() == null || expenseRequest.getDescription().trim().isEmpty()) {
            expenseRequest.setDescription("Expense from voice input");
            log.warn("Setting default description");
        }
    }
}
