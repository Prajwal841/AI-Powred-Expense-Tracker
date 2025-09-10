package com.example.user.userservice.config;

import com.example.user.userservice.entity.Category;
import com.example.user.userservice.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class CategoryLoader {

    @Bean
    CommandLineRunner loadCategories(CategoryRepository categoryRepository) {
        return args -> {
            List<String> categories = List.of(
                    "Food & Dining",
                    "Transportation",
                    "Housing & Utilities",
                    "Health & Fitness",
                    "Shopping",
                    "Entertainment",
                    "Travel",
                    "Education",
                    "Savings & Investments",
                    "Debt & Loans",
                    "Personal Care",
                    "Others"
            );

            for (String categoryName : categories) {
                categoryRepository.findByName(categoryName)
                        .orElseGet(() -> categoryRepository.save(
                                Category.builder().name(categoryName).build()
                        ));
            }
        };
    }
}
