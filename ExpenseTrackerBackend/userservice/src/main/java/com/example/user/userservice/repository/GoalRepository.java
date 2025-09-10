package com.example.user.userservice.repository;

import com.example.user.userservice.entity.Goal;
import com.example.user.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    List<Goal> findByUserOrderByCreatedAtDesc(User user);
    
    List<Goal> findByUserAndStatusOrderByCreatedAtDesc(User user, Goal.GoalStatus status);
    
    Optional<Goal> findByUserAndId(User user, Long id);
    
    long countByUserAndStatus(User user, Goal.GoalStatus status);
    
    List<Goal> findByUserAndTypeOrderByCreatedAtDesc(User user, Goal.GoalType type);
}


