package com.example.user.userservice.service;

import com.example.user.userservice.dto.CategoryRequest;
import com.example.user.userservice.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {
    
    CategoryResponse createCategory(CategoryRequest request);
    
    CategoryResponse updateCategory(Long categoryId, CategoryRequest request);
    
    CategoryResponse getCategoryById(Long categoryId);
    
    List<CategoryResponse> getAllCategories();
    
    void deleteCategory(Long categoryId);
    
    boolean existsByName(String name);
}
