package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.dto.CategoryRequest;
import com.example.user.userservice.dto.CategoryResponse;
import com.example.user.userservice.entity.Category;
import com.example.user.userservice.exception.CategoryException;
import com.example.user.userservice.repository.BudgetRepository;
import com.example.user.userservice.repository.CategoryRepository;
import com.example.user.userservice.repository.ExpenseRepository;
import com.example.user.userservice.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        log.info("Creating category with name: {}", request.getName());

        // Check if category already exists
        if (existsByName(request.getName())) {
            throw new CategoryException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());

        return buildCategoryResponse(savedCategory);
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {
        log.info("Updating category ID: {} with name: {}", categoryId, request.getName());

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + categoryId));

        // Check if new name already exists (excluding current category)
        Optional<Category> existingCategory = categoryRepository.findByName(request.getName().trim());
        if (existingCategory.isPresent() && !existingCategory.get().getId().equals(categoryId)) {
            throw new CategoryException("Category with name '" + request.getName() + "' already exists");
        }

        category.setName(request.getName().trim());
        Category updatedCategory = categoryRepository.save(category);

        log.info("Category updated successfully with ID: {}", updatedCategory.getId());
        return buildCategoryResponse(updatedCategory);
    }

    @Override
    public CategoryResponse getCategoryById(Long categoryId) {
        log.debug("Fetching category ID: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + categoryId));

        return buildCategoryResponse(category);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        log.debug("Fetching all categories");

        List<Category> categories = categoryRepository.findAllByOrderByIdAsc();
        log.info("Retrieved {} categories", categories.size());

        return categories.stream()
                .map(this::buildCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(Long categoryId) {
        log.info("Deleting category ID: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryException("Category not found with ID: " + categoryId));

        // Check if category is being used in budgets or expenses
        long budgetCount = budgetRepository.countByCategory(category);
        long expenseCount = expenseRepository.countByCategory(category);

        if (budgetCount > 0 || expenseCount > 0) {
            throw new CategoryException("Cannot delete category '" + category.getName() + 
                    "' as it is being used in " + budgetCount + " budgets and " + expenseCount + " expenses");
        }

        categoryRepository.delete(category);
        log.info("Category deleted successfully with ID: {}", categoryId);
    }

    @Override
    public boolean existsByName(String name) {
        log.debug("Checking if category exists with name: {}", name);
        return categoryRepository.findByName(name.trim()).isPresent();
    }

    // Helper method
    private CategoryResponse buildCategoryResponse(Category category) {
        // Calculate usage count
        long budgetCount = budgetRepository.countByCategory(category);
        long expenseCount = expenseRepository.countByCategory(category);
        long totalUsage = budgetCount + expenseCount;

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .usageCount(totalUsage)
                .build();
    }
}
