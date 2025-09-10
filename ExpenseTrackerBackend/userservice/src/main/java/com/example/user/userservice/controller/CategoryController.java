package com.example.user.userservice.controller;

import com.example.user.userservice.dto.CategoryRequest;
import com.example.user.userservice.dto.CategoryResponse;
import com.example.user.userservice.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/user/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        log.info("Creating category with name: {}", request.getName());
        
        CategoryResponse response = categoryService.createCategory(request);
        
        log.info("Category created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest request) {
        
        log.info("Updating category ID: {} with name: {}", categoryId, request.getName());
        
        CategoryResponse response = categoryService.updateCategory(categoryId, request);
        
        log.info("Category updated successfully with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long categoryId) {
        log.debug("Fetching category ID: {}", categoryId);
        
        CategoryResponse response = categoryService.getCategoryById(categoryId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        log.info("Fetching all categories");
        
        List<CategoryResponse> responses = categoryService.getAllCategories();
        
        log.info("Retrieved {} categories", responses.size());
        log.info("Categories: {}", responses.stream().map(CategoryResponse::getName).toList());
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        log.info("Deleting category ID: {}", categoryId);
        
        categoryService.deleteCategory(categoryId);
        
        log.info("Category deleted successfully with ID: {}", categoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-exists")
    public ResponseEntity<Boolean> checkCategoryExists(@RequestParam String name) {
        log.debug("Checking if category exists with name: {}", name);
        
        boolean exists = categoryService.existsByName(name);
        
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testCategories() {
        log.info("Testing categories endpoint");
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Categories endpoint is working");
        response.put("timestamp", System.currentTimeMillis());
        
        try {
            List<CategoryResponse> categories = categoryService.getAllCategories();
            response.put("categoriesCount", categories.size());
            response.put("categories", categories.stream().map(CategoryResponse::getName).toList());
            response.put("status", "success");
        } catch (Exception e) {
            log.error("Error fetching categories in test endpoint", e);
            response.put("error", e.getMessage());
            response.put("status", "error");
        }
        
        return ResponseEntity.ok(response);
    }
}
