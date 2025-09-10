package com.example.user.userservice.service;

import com.example.user.userservice.dto.ParseExpenseRequest;
import com.example.user.userservice.entity.Category;
import com.example.user.userservice.entity.Expense;
import com.example.user.userservice.entity.User;
import com.example.user.userservice.repository.CategoryRepository;
import com.example.user.userservice.repository.ExpenseRepository;
import com.example.user.userservice.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiExpenseParserServiceTest {

    @Mock
    private WebClient hfWebClient;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AiExpenseParserService aiExpenseParserService;

    private User testUser;
    private Category testCategory;
    private ParseExpenseRequest testRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .build();

        testCategory = Category.builder()
                .id(1L)
                .name("Food & Dining")
                .build();

        testRequest = new ParseExpenseRequest();
        testRequest.setText("I spent 300 rs yesterday on sandwich");
        testRequest.setTimezone("Asia/Kolkata");
        testRequest.setCurrency("INR");
        testRequest.setLocale("en-IN");
    }

    @Test
    void testFallbackToRegexWhenAIFails() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(categoryRepository.findByName("Other")).thenReturn(Optional.of(testCategory));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> {
            Expense expense = invocation.getArgument(0);
            expense.setId(1L);
            return expense;
        });

        // When
        var result = aiExpenseParserService.parseAndCreateExpense(testRequest, 1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getExpenseId());
        assertEquals(300.0, result.getAmount());
        assertEquals("INR", result.getCurrency());
        assertEquals("AI_FALLBACK", result.getSource());
        assertEquals(0.3, result.getConfidence());

        verify(expenseRepository).save(any(Expense.class));
    }

    @Test
    void testUserNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            aiExpenseParserService.parseAndCreateExpense(testRequest, 1L);
        });
    }

    @Test
    void testInvalidAmountInText() {
        // Given
        testRequest.setText("I spent some money on food");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            aiExpenseParserService.parseAndCreateExpense(testRequest, 1L);
        });
    }
}
