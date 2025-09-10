package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.dto.BudgetRequest;
import com.example.user.userservice.dto.BudgetResponse;
import com.example.user.userservice.dto.BudgetSummaryResponse;
import com.example.user.userservice.entity.Budget;
import com.example.user.userservice.entity.Category;
import com.example.user.userservice.entity.User;
import com.example.user.userservice.exception.BudgetException;
import com.example.user.userservice.exception.CategoryException;
import com.example.user.userservice.repository.BudgetRepository;
import com.example.user.userservice.repository.CategoryRepository;
import com.example.user.userservice.repository.ExpenseRepository;
import com.example.user.userservice.repository.UserRepository;
import com.example.user.userservice.service.BudgetService;
import com.example.user.userservice.service.MonthlyBudgetTargetService;
import com.example.user.userservice.dto.MonthlyBudgetTargetResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final MonthlyBudgetTargetService targetService;

    @Override
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        log.info("Creating budget for user ID: {} with category ID: {} for month: {}", 
                userId, request.getCategoryId(), request.getMonth());

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BudgetException("User not found with ID: " + userId));

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + request.getCategoryId()));

        // Validate month format
        YearMonth yearMonth = validateAndParseMonth(request.getMonth());

        // Check if budget already exists for this user, category, and month
        if (existsByUserAndCategoryAndMonth(userId, request.getCategoryId(), request.getMonth())) {
            throw new BudgetException("Budget already exists for category '" + category.getName() + 
                    "' in month " + request.getMonth());
        }

        // Create budget
        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .limitAmount(request.getLimitAmount())
                .month(request.getMonth())
                .build();

        Budget savedBudget = budgetRepository.save(budget);
        log.info("Budget created successfully with ID: {}", savedBudget.getId());

        return buildBudgetResponse(savedBudget);
    }

    @Override
    public BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request) {
        log.info("Updating budget ID: {} for user ID: {}", budgetId, userId);

        // Find existing budget
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new BudgetException("Budget not found with ID: " + budgetId));

        // Validate ownership
        if (!budget.getUser().getId().equals(userId)) {
            throw new BudgetException("Budget does not belong to user ID: " + userId);
        }

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + request.getCategoryId()));

        // Validate month format
        YearMonth yearMonth = validateAndParseMonth(request.getMonth());

        // Check if another budget exists for the same category and month (excluding current budget)
        Optional<Budget> existingBudget = budgetRepository.findByUserAndCategoryAndMonth(
                budget.getUser(), category, request.getMonth());
        if (existingBudget.isPresent() && !existingBudget.get().getId().equals(budgetId)) {
            throw new BudgetException("Budget already exists for category '" + category.getName() + 
                    "' in month " + request.getMonth());
        }

        // Update budget
        budget.setCategory(category);
        budget.setLimitAmount(request.getLimitAmount());
        budget.setMonth(request.getMonth());

        Budget updatedBudget = budgetRepository.save(budget);
        log.info("Budget updated successfully with ID: {}", updatedBudget.getId());

        return buildBudgetResponse(updatedBudget);
    }

    @Override
    public BudgetResponse getBudgetById(Long userId, Long budgetId) {
        log.debug("Fetching budget ID: {} for user ID: {}", budgetId, userId);

        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new BudgetException("Budget not found with ID: " + budgetId));

        // Validate ownership
        if (!budget.getUser().getId().equals(userId)) {
            throw new BudgetException("Budget does not belong to user ID: " + userId);
        }

        return buildBudgetResponse(budget);
    }

    @Override
    public List<BudgetResponse> getAllBudgetsByUser(Long userId) {
        log.debug("Fetching all budgets for user ID: {}", userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BudgetException("User not found with ID: " + userId));

        List<Budget> budgets = budgetRepository.findByUser(user);
        log.info("Found {} budgets for user ID: {}", budgets.size(), userId);

        return budgets.stream()
                .map(this::buildBudgetResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BudgetResponse> getBudgetsByUserAndMonth(Long userId, String month) {
        log.debug("Fetching budgets for user ID: {} and month: {}", userId, month);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BudgetException("User not found with ID: " + userId));

        // Validate month format
        YearMonth yearMonth = validateAndParseMonth(month);

        List<Budget> budgets = budgetRepository.findByUser(user).stream()
                .filter(budget -> budget.getMonth().equals(month))
                .collect(Collectors.toList());

        log.info("Found {} budgets for user ID: {} in month: {}", budgets.size(), userId, month);

        return budgets.stream()
                .map(this::buildBudgetResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BudgetSummaryResponse getBudgetSummary(Long userId, String month) {
        log.info("Generating budget summary for user ID: {} and month: {}", userId, month);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BudgetException("User not found with ID: " + userId));

        // Validate month format
        YearMonth yearMonth = validateAndParseMonth(month);

        List<BudgetResponse> budgets = getBudgetsByUserAndMonth(userId, month);

        double totalBudget = budgets.stream()
                .mapToDouble(BudgetResponse::getLimitAmount)
                .sum();

        double totalSpent = budgets.stream()
                .mapToDouble(BudgetResponse::getSpentAmount)
                .sum();

        double totalRemaining = totalBudget - totalSpent;
        double overallPercentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        String overallStatus = determineOverallStatus(overallPercentageUsed);

        int categoriesUnderBudget = (int) budgets.stream()
                .filter(budget -> "UNDER_BUDGET".equals(budget.getStatus()))
                .count();

        int categoriesOverBudget = (int) budgets.stream()
                .filter(budget -> "OVER_BUDGET".equals(budget.getStatus()))
                .count();

        // Get target budget if exists
        Double targetBudget = null;
        Double targetVsActualPercentage = null;
        try {
            Optional<MonthlyBudgetTargetResponse> targetResponse = targetService.getActiveTargetByUserAndMonth(userId, month);
            if (targetResponse.isPresent()) {
                targetBudget = targetResponse.get().getTargetAmount();
                targetVsActualPercentage = targetBudget > 0 ? (totalSpent / targetBudget) * 100 : 0;
            }
        } catch (Exception e) {
            log.warn("Could not fetch target budget for user {} and month {}: {}", userId, month, e.getMessage());
        }

        return BudgetSummaryResponse.builder()
                .userId(userId)
                .userName(user.getName())
                .month(month)
                .totalBudget(totalBudget)
                .targetBudget(targetBudget)
                .totalSpent(totalSpent)
                .totalRemaining(totalRemaining)
                .overallPercentageUsed(overallPercentageUsed)
                .overallStatus(overallStatus)
                .budgets(budgets)
                .totalCategories(budgets.size())
                .categoriesUnderBudget(categoriesUnderBudget)
                .categoriesOverBudget(categoriesOverBudget)
                .targetVsActualPercentage(targetVsActualPercentage)
                .build();
    }

    @Override
    public void deleteBudget(Long userId, Long budgetId) {
        log.info("Deleting budget ID: {} for user ID: {}", budgetId, userId);

        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new BudgetException("Budget not found with ID: " + budgetId));

        // Validate ownership
        if (!budget.getUser().getId().equals(userId)) {
            throw new BudgetException("Budget does not belong to user ID: " + userId);
        }

        budgetRepository.delete(budget);
        log.info("Budget deleted successfully with ID: {}", budgetId);
    }

    @Override
    public boolean existsByUserAndCategoryAndMonth(Long userId, Long categoryId, String month) {
        log.debug("Checking if budget exists for user ID: {}, category ID: {}, month: {}", 
                userId, categoryId, month);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BudgetException("User not found with ID: " + userId));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + categoryId));

        // Validate month format but pass string to repository
        validateAndParseMonth(month);

        return budgetRepository.findByUserAndCategoryAndMonth(user, category, month).isPresent();
    }

    // Helper methods
    private YearMonth validateAndParseMonth(String month) {
        try {
            return YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
        } catch (DateTimeParseException e) {
            throw new BudgetException("Invalid month format. Expected format: YYYY-MM (e.g., 2025-08)");
        }
    }

    private BudgetResponse buildBudgetResponse(Budget budget) {
        // Calculate spent amount from expenses
        double spentAmount = expenseRepository.findByUserAndCategoryAndMonth(
                budget.getUser().getId(), 
                budget.getCategory().getId(), 
                budget.getMonth())
                .stream()
                .mapToDouble(expense -> expense.getAmount())
                .sum();

        double remainingAmount = budget.getLimitAmount() - spentAmount;
        double percentageUsed = budget.getLimitAmount() > 0 ? (spentAmount / budget.getLimitAmount()) * 100 : 0;
        String status = determineBudgetStatus(percentageUsed);

        return BudgetResponse.builder()
                .id(budget.getId())
                .userId(budget.getUser().getId())
                .userName(budget.getUser().getName())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .limitAmount(budget.getLimitAmount())
                .spentAmount(spentAmount)
                .remainingAmount(remainingAmount)
                .month(budget.getMonth())
                .yearMonth(YearMonth.parse(budget.getMonth(), DateTimeFormatter.ofPattern("yyyy-MM")))
                .status(status)
                .percentageUsed(percentageUsed)
                .build();
    }

    private String determineBudgetStatus(double percentageUsed) {
        if (percentageUsed >= 100) {
            return "OVER_BUDGET";
        } else if (percentageUsed >= 80) {
            return "ON_TRACK";
        } else {
            return "UNDER_BUDGET";
        }
    }

    private String determineOverallStatus(double percentageUsed) {
        if (percentageUsed >= 100) {
            return "OVER_BUDGET";
        } else if (percentageUsed >= 80) {
            return "ON_TRACK";
        } else {
            return "UNDER_BUDGET";
        }
    }
}
