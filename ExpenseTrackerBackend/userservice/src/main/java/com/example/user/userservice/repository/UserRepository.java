package com.example.user.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.user.userservice.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
