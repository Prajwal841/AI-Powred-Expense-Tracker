package com.example.user.userservice.service;

import com.example.user.userservice.dto.ExpenseRequest;
import com.example.user.userservice.dto.ExpenseResponse;
import com.example.user.userservice.dto.ExpenseSummaryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ExpenseService {
    
    ExpenseResponse createExpense(Long userId, ExpenseRequest request);
    
    ExpenseResponse createExpenseWithReceipt(Long userId, ExpenseRequest request, MultipartFile receipt);
    
    ExpenseResponse createExpenseWithBase64Receipt(Long userId, ExpenseRequest request, String base64Receipt, String fileName);
    
    ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request);
    
    ExpenseResponse updateExpenseWithReceipt(Long userId, Long expenseId, ExpenseRequest request, MultipartFile receipt);
    
    ExpenseResponse updateExpenseWithBase64Receipt(Long userId, Long expenseId, ExpenseRequest request, String base64Receipt, String fileName);
    
    ExpenseResponse getExpenseById(Long userId, Long expenseId);
    
    List<ExpenseResponse> getAllExpensesByUser(Long userId);
    
    List<ExpenseResponse> getExpensesByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);
    
    List<ExpenseResponse> getExpensesByUserAndCategory(Long userId, Long categoryId);
    
    List<ExpenseResponse> getExpensesByUserAndMonth(Long userId, String month);
    
    ExpenseSummaryResponse getExpenseSummary(Long userId, LocalDate startDate, LocalDate endDate);
    
    void deleteExpense(Long userId, Long expenseId);
    
    String uploadReceipt(Long userId, Long expenseId, MultipartFile receipt);
    
    void deleteReceipt(Long userId, Long expenseId);
    
    List<Map<String, Object>> getReceiptsByUser(Long userId);
}
