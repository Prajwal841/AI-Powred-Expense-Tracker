package com.example.user.userservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.user.userservice.entity.Category;
//import com.example.user.userservice.entity.User;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);  // check if category already exists
    List<Category> findAllByOrderByIdAsc();      // get all categories ordered by ID
//    List<Category> findByUser(User user);        // if categories are user-specific
}
