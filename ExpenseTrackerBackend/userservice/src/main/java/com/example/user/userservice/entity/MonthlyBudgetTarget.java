package com.example.user.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "monthly_budget_targets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyBudgetTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double targetAmount; // overall monthly budget target

    @Column(nullable = false)
    private String month;   // store as "2025-08" (format YearMonth.toString())

    @Column(name = "is_active")
    private Boolean isActive = true; // allows users to have historical targets
    
    // Custom getter to maintain compatibility with existing code
    public boolean getIsActive() {
        return isActive != null && isActive;
    }
}
