package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.dto.ExpenseRequest;
import com.example.user.userservice.dto.ExpenseResponse;
import com.example.user.userservice.dto.ExpenseSummaryResponse;
import com.example.user.userservice.entity.Category;
import com.example.user.userservice.entity.Expense;
import com.example.user.userservice.entity.User;
import com.example.user.userservice.exception.CategoryException;
import com.example.user.userservice.exception.ExpenseException;
import com.example.user.userservice.repository.CategoryRepository;
import com.example.user.userservice.repository.ExpenseRepository;
import com.example.user.userservice.repository.UserRepository;
import com.example.user.userservice.service.ExpenseService;
import com.example.user.userservice.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.Base64;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Override
    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        return createExpenseInternal(userId, request, null);
    }

    // Private method to create expense with optional receipt path
    private ExpenseResponse createExpenseInternal(Long userId, ExpenseRequest request, String receiptPath) {
        log.info("Creating expense for user ID: {} with name: {} and amount: {}", 
                userId, request.getName(), request.getAmount());

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + request.getCategoryId()));

        // Create expense
        Expense expense = Expense.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .amount(request.getAmount())
                .date(request.getDate())
                .source(request.getSource() != null ? request.getSource() : "manual")
                .paymentMethod(request.getPaymentMethod())
                .tags(request.getTags())
                .receiptPath(receiptPath) // Set receipt path if provided
                .build();

        Expense savedExpense = expenseRepository.save(expense);
        log.info("Expense created successfully with ID: {}", savedExpense.getId());

        return buildExpenseResponse(savedExpense);
    }

    @Override
    public ExpenseResponse createExpenseWithReceipt(Long userId, ExpenseRequest request, MultipartFile receipt) {
        log.info("Creating expense with receipt for user ID: {} with name: {}", userId, request.getName());

        // Create expense first
        ExpenseResponse expenseResponse = createExpense(userId, request);

        // Upload receipt if provided
        if (receipt != null && !receipt.isEmpty()) {
            String receiptPath = uploadReceipt(userId, expenseResponse.getId(), receipt);
            log.info("Receipt uploaded successfully for expense ID: {}", expenseResponse.getId());
            
            // Fetch and return the updated expense with receipt path
            return getExpenseById(userId, expenseResponse.getId());
        }

        return expenseResponse;
    }

    @Override
    public ExpenseResponse createExpenseWithBase64Receipt(Long userId, ExpenseRequest request, String base64Receipt, String fileName) {
        log.info("Creating expense with base64 receipt for user ID: {} with name: {}", userId, request.getName());

        // Create expense first
        ExpenseResponse expenseResponse = createExpense(userId, request);

        // Upload base64 receipt if provided
        if (base64Receipt != null && !base64Receipt.trim().isEmpty()) {
            String receiptPath = uploadBase64Receipt(userId, expenseResponse.getId(), base64Receipt, fileName);
            log.info("Base64 receipt uploaded successfully for expense ID: {}", expenseResponse.getId());
            
            // Fetch and return the updated expense with receipt path
            return getExpenseById(userId, expenseResponse.getId());
        }

        return expenseResponse;
    }

    @Override
    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        log.info("Updating expense ID: {} for user ID: {}", expenseId, userId);

        // Find existing expense
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException("Expense not found with ID: " + expenseId));

        // Validate ownership
        if (!expense.getUser().getId().equals(userId)) {
            throw new ExpenseException("Expense does not belong to user ID: " + userId);
        }

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + request.getCategoryId()));

        // Update expense
        expense.setName(request.getName());
        expense.setDescription(request.getDescription());
        expense.setCategory(category);
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setTags(request.getTags());

        Expense updatedExpense = expenseRepository.save(expense);
        log.info("Expense updated successfully with ID: {}", updatedExpense.getId());

        return buildExpenseResponse(updatedExpense);
    }

    @Override
    public ExpenseResponse updateExpenseWithReceipt(Long userId, Long expenseId, ExpenseRequest request, MultipartFile receipt) {
        log.info("Updating expense with receipt for expense ID: {} and user ID: {}", expenseId, userId);

        // Update expense first
        ExpenseResponse expenseResponse = updateExpense(userId, expenseId, request);

        // Upload new receipt if provided
        if (receipt != null && !receipt.isEmpty()) {
            // Delete old receipt if exists
            deleteReceipt(userId, expenseId);
            
            // Upload new receipt
            String receiptPath = uploadReceipt(userId, expenseId, receipt);
            log.info("Receipt updated successfully for expense ID: {}", expenseId);
            
            // Fetch and return the updated expense with receipt path
            return getExpenseById(userId, expenseId);
        }

        return expenseResponse;
    }

    @Override
    public ExpenseResponse updateExpenseWithBase64Receipt(Long userId, Long expenseId, ExpenseRequest request, String base64Receipt, String fileName) {
        log.info("Updating expense with base64 receipt for expense ID: {} and user ID: {}", expenseId, userId);

        // Update expense first
        ExpenseResponse expenseResponse = updateExpense(userId, expenseId, request);

        // Upload new base64 receipt if provided
        if (base64Receipt != null && !base64Receipt.trim().isEmpty()) {
            // Delete old receipt if exists
            deleteReceipt(userId, expenseId);
            
            // Upload new base64 receipt
            String receiptPath = uploadBase64Receipt(userId, expenseId, base64Receipt, fileName);
            log.info("Base64 receipt updated successfully for expense ID: {}", expenseId);
            
            // Fetch and return the updated expense with receipt path
            return getExpenseById(userId, expenseId);
        }

        return expenseResponse;
    }

    @Override
    public ExpenseResponse getExpenseById(Long userId, Long expenseId) {
        log.debug("Fetching expense ID: {} for user ID: {}", expenseId, userId);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException("Expense not found with ID: " + expenseId));

        // Validate ownership
        if (!expense.getUser().getId().equals(userId)) {
            throw new ExpenseException("Expense does not belong to user ID: " + userId);
        }

        return buildExpenseResponse(expense);
    }

    @Override
    public List<ExpenseResponse> getAllExpensesByUser(Long userId) {
        log.debug("Fetching all expenses for user ID: {}", userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));

        List<Expense> expenses = expenseRepository.findByUser(user);
        log.info("Found {} expenses for user ID: {}", expenses.size(), userId);

        return expenses.stream()
                .map(this::buildExpenseResponse)
                .sorted(Comparator.comparing(ExpenseResponse::getDate).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseResponse> getExpensesByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching expenses for user ID: {} between {} and {}", userId, startDate, endDate);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));

        List<Expense> expenses = expenseRepository.findByUser(user).stream()
                .filter(expense -> !expense.getDate().isBefore(startDate) && !expense.getDate().isAfter(endDate))
                .collect(Collectors.toList());

        log.info("Found {} expenses for user ID: {} in date range", expenses.size(), userId);

        return expenses.stream()
                .map(this::buildExpenseResponse)
                .sorted(Comparator.comparing(ExpenseResponse::getDate).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseResponse> getExpensesByUserAndCategory(Long userId, Long categoryId) {
        log.debug("Fetching expenses for user ID: {} and category ID: {}", userId, categoryId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));

        // Validate category exists
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + categoryId));

        List<Expense> expenses = expenseRepository.findByUser(user).stream()
                .filter(expense -> expense.getCategory().getId().equals(categoryId))
                .collect(Collectors.toList());

        log.info("Found {} expenses for user ID: {} in category: {}", expenses.size(), userId, category.getName());

        return expenses.stream()
                .map(this::buildExpenseResponse)
                .sorted(Comparator.comparing(ExpenseResponse::getDate).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseResponse> getExpensesByUserAndMonth(Long userId, String month) {
        log.debug("Fetching expenses for user ID: {} and month: {}", userId, month);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));

        // Parse month (YYYY-MM format)
        LocalDate startDate = LocalDate.parse(month + "-01");
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        return getExpensesByUserAndDateRange(userId, startDate, endDate);
    }

    @Override
    public ExpenseSummaryResponse getExpenseSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Generating expense summary for user ID: {} between {} and {}", userId, startDate, endDate);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));

        List<ExpenseResponse> expenses = getExpensesByUserAndDateRange(userId, startDate, endDate);

        double totalExpenses = expenses.stream()
                .mapToDouble(ExpenseResponse::getAmount)
                .sum();

        double averageExpense = expenses.isEmpty() ? 0 : totalExpenses / expenses.size();

        // Group by category
        Map<String, Double> expensesByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        ExpenseResponse::getCategoryName,
                        Collectors.summingDouble(ExpenseResponse::getAmount)
                ));

        Map<String, Integer> transactionsByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        ExpenseResponse::getCategoryName,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        // Find highest and lowest expenses
        Optional<ExpenseResponse> highestExpense = expenses.stream()
                .max(Comparator.comparing(ExpenseResponse::getAmount));

        Optional<ExpenseResponse> lowestExpense = expenses.stream()
                .min(Comparator.comparing(ExpenseResponse::getAmount));

        // Find most expensive and frequent categories
        String mostExpensiveCategory = expensesByCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        String mostFrequentCategory = transactionsByCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        return ExpenseSummaryResponse.builder()
                .userId(userId)
                .userName(user.getName())
                .startDate(startDate)
                .endDate(endDate)
                .totalExpenses(totalExpenses)
                .totalTransactions(expenses.size())
                .averageExpense(averageExpense)
                .expensesByCategory(expensesByCategory)
                .transactionsByCategory(transactionsByCategory)
                .recentExpenses(expenses.stream().limit(10).collect(Collectors.toList()))
                .highestExpense(highestExpense.map(ExpenseResponse::getAmount).orElse(0.0))
                .lowestExpense(lowestExpense.map(ExpenseResponse::getAmount).orElse(0.0))
                .mostExpensiveCategory(mostExpensiveCategory)
                .mostFrequentCategory(mostFrequentCategory)
                .build();
    }

    @Override
    public void deleteExpense(Long userId, Long expenseId) {
        log.info("Deleting expense ID: {} for user ID: {}", expenseId, userId);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException("Expense not found with ID: " + expenseId));

        // Validate ownership
        if (!expense.getUser().getId().equals(userId)) {
            throw new ExpenseException("Expense does not belong to user ID: " + userId);
        }

        // Delete receipt if exists
        if (expense.getReceiptPath() != null && !expense.getReceiptPath().trim().isEmpty()) {
            deleteReceipt(userId, expenseId);
        }

        expenseRepository.delete(expense);
        log.info("Expense deleted successfully with ID: {}", expenseId);
    }

    @Override
    public String uploadReceipt(Long userId, Long expenseId, MultipartFile receipt) {
        log.info("Uploading receipt for expense ID: {} and user ID: {}", expenseId, userId);

        // Validate expense exists and belongs to user
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException("Expense not found with ID: " + expenseId));

        if (!expense.getUser().getId().equals(userId)) {
            throw new ExpenseException("Expense does not belong to user ID: " + userId);
        }

        // Store file
        String receiptPath = fileStorageService.storeFile(receipt, "receipts/" + userId);

        // Update expense with receipt path
        expense.setReceiptPath(receiptPath);
        expenseRepository.save(expense);

        log.info("Receipt uploaded successfully for expense ID: {} at path: {}", expenseId, receiptPath);
        return receiptPath;
    }

    public String uploadBase64Receipt(Long userId, Long expenseId, String base64Receipt, String fileName) {
        log.info("Uploading base64 receipt for expense ID: {} and user ID: {}", expenseId, userId);

        // Validate expense exists and belongs to user
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException("Expense not found with ID: " + expenseId));

        if (!expense.getUser().getId().equals(userId)) {
            throw new ExpenseException("Expense does not belong to user ID: " + userId);
        }

        try {
            // Convert base64 to MultipartFile
            MultipartFile receiptFile = convertBase64ToMultipartFile(base64Receipt, fileName);
            
            // Store file
            String receiptPath = fileStorageService.storeFile(receiptFile, "receipts/" + userId);

            // Update expense with receipt path
            expense.setReceiptPath(receiptPath);
            expenseRepository.save(expense);

            log.info("Base64 receipt uploaded successfully for expense ID: {} at path: {}", expenseId, receiptPath);
            return receiptPath;
        } catch (Exception e) {
            log.error("Failed to upload base64 receipt: {}", e.getMessage(), e);
            throw new ExpenseException("Failed to upload base64 receipt: " + e.getMessage());
        }
    }

    @Override
    public void deleteReceipt(Long userId, Long expenseId) {
        log.info("Deleting receipt for expense ID: {} and user ID: {}", expenseId, userId);

        // Validate expense exists and belongs to user
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException("Expense not found with ID: " + expenseId));

        if (!expense.getUser().getId().equals(userId)) {
            throw new ExpenseException("Expense does not belong to user ID: " + userId);
        }

        // Delete file if exists
        if (expense.getReceiptPath() != null && !expense.getReceiptPath().trim().isEmpty()) {
            fileStorageService.deleteFile(expense.getReceiptPath());
            
            // Clear receipt path
            expense.setReceiptPath(null);
            expenseRepository.save(expense);
            
            log.info("Receipt deleted successfully for expense ID: {}", expenseId);
        } else {
            log.warn("No receipt found for expense ID: {}", expenseId);
        }
    }

    // Helper methods
    private ExpenseResponse buildExpenseResponse(Expense expense) {
        List<String> tagList = expense.getTags() != null ? 
                Arrays.asList(expense.getTags().split(",")) : 
                new ArrayList<>();

        String formattedDate = expense.getDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        String formattedAmount = String.format("₹%.2f", expense.getAmount());

        // Convert file path to complete URL for frontend access
        String receiptUrl = null;
        if (expense.getReceiptPath() != null && !expense.getReceiptPath().trim().isEmpty()) {
            receiptUrl = fileStorageService.getFileUrl(expense.getReceiptPath());
            log.info("Converted receipt path to URL: {} -> {}", expense.getReceiptPath(), receiptUrl);
        }

        return ExpenseResponse.builder()
                .id(expense.getId())
                .userId(expense.getUser().getId())
                .userName(expense.getUser().getName())
                .name(expense.getName())
                .description(expense.getDescription())
                .categoryId(expense.getCategory().getId())
                .categoryName(expense.getCategory().getName())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .source(expense.getSource())
                .receiptPath(receiptUrl) // Return URL instead of file path
                .paymentMethod(expense.getPaymentMethod())
                .tags(expense.getTags())
                .tagList(tagList)
                .formattedDate(formattedDate)
                .formattedAmount(formattedAmount)
                .build();
    }

    private MultipartFile convertBase64ToMultipartFile(String base64Data, String fileName) throws IOException {
        log.info("Converting base64 data to MultipartFile for fileName: {}", fileName);
        
        // Remove data URL prefix if present
        String base64Image = base64Data;
        final String contentType;
        
        if (base64Data.startsWith("data:image/")) {
            String[] parts = base64Data.split(",");
            if (parts.length == 2) {
                // Extract content type from data URL
                String dataUrlPrefix = parts[0];
                if (dataUrlPrefix.contains(";")) {
                    contentType = dataUrlPrefix.split(";")[0].substring(5); // Remove "data:" prefix
                } else {
                    contentType = "image/jpeg"; // Default if no content type specified
                }
                base64Image = parts[1];
                log.info("Extracted content type: {} from data URL", contentType);
            } else {
                contentType = "image/jpeg"; // Default content type
            }
        } else {
            contentType = "image/jpeg"; // Default content type
        }

        // Validate base64 data
        if (base64Image == null || base64Image.trim().isEmpty()) {
            throw new IOException("Base64 image data is null or empty");
        }

        // Decode base64 to byte array
        byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(base64Image);
            log.info("Successfully decoded base64 data to {} bytes", imageBytes.length);
        } catch (IllegalArgumentException e) {
            log.error("Invalid base64 data: {}", e.getMessage());
            throw new IOException("Invalid base64 data: " + e.getMessage());
        }

        // Validate decoded data
        if (imageBytes.length == 0) {
            throw new IOException("Decoded image data is empty");
        }

        // Create MultipartFile from byte array
        return new MultipartFile() {
            @Override
            public String getName() {
                return "image";
            }

            @Override
            public String getOriginalFilename() {
                return fileName;
            }

            @Override
            public String getContentType() {
                return contentType;
            }

            @Override
            public boolean isEmpty() {
                return imageBytes.length == 0;
            }

            @Override
            public long getSize() {
                return imageBytes.length;
            }

            @Override
            public byte[] getBytes() throws IOException {
                return imageBytes;
            }

            @Override
            public java.io.InputStream getInputStream() throws IOException {
                return new ByteArrayInputStream(imageBytes);
            }

            @Override
            public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
                java.nio.file.Files.write(dest.toPath(), imageBytes);
            }
        };
    }

    @Override
    public List<Map<String, Object>> getReceiptsByUser(Long userId) {
        log.info("Fetching receipts for user ID: {}", userId);
        
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ExpenseException("User not found with ID: " + userId));
        
        // Get all expenses with receipts for the user
        List<Expense> expensesWithReceipts = expenseRepository.findByUserAndReceiptPathIsNotNull(user);
        
        // Convert to Map format for frontend compatibility
        List<Map<String, Object>> receipts = expensesWithReceipts.stream()
                .map(expense -> {
                    Map<String, Object> receipt = new HashMap<>();
                    receipt.put("id", expense.getId());
                    receipt.put("name", expense.getName());
                    receipt.put("amount", expense.getAmount());
                    receipt.put("date", expense.getDate());
                    receipt.put("receiptPath", expense.getReceiptPath());
                    receipt.put("category", expense.getCategory() != null ? expense.getCategory().getName() : null);
                    receipt.put("description", expense.getDescription());
                    return receipt;
                })
                .collect(Collectors.toList());
        
        log.info("Retrieved {} receipts for user ID: {}", receipts.size(), userId);
        return receipts;
    }
}
