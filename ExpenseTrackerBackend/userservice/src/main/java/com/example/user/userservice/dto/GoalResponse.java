package com.example.user.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {
    
    private Long id;
    private String title;
    private String description;
    private Double targetAmount;
    private Double currentAmount;
    private String type;
    private String typeDisplayName;
    private String status;
    private String statusDisplayName;
    private LocalDate targetDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double progressPercentage;
    private Long daysRemaining;
    private String progressStatus; // "on-track", "behind", "ahead", "completed"
}


