package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.dto.GoalRequest;
import com.example.user.userservice.dto.GoalResponse;
import com.example.user.userservice.entity.Goal;
import com.example.user.userservice.entity.User;
import com.example.user.userservice.exception.GoalException;
import com.example.user.userservice.repository.GoalRepository;
import com.example.user.userservice.repository.UserRepository;
import com.example.user.userservice.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    @Override
    public GoalResponse createGoal(Long userId, GoalRequest request) {
        log.info("Creating goal for user ID: {} with title: {}", userId, request.getTitle());

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GoalException("User not found with ID: " + userId));

        // Validate goal type
        Goal.GoalType goalType = validateAndParseGoalType(request.getType());

        // Create goal
        Goal goal = Goal.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .targetAmount(request.getTargetAmount())
                .currentAmount(0.0)
                .type(goalType)
                .status(Goal.GoalStatus.ACTIVE)
                .targetDate(request.getTargetDate())
                .build();

        Goal savedGoal = goalRepository.save(goal);
        log.info("Goal created successfully with ID: {}", savedGoal.getId());

        return buildGoalResponse(savedGoal);
    }

    @Override
    public GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request) {
        log.info("Updating goal ID: {} for user ID: {}", goalId, userId);

        // Find existing goal
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new GoalException("Goal not found with ID: " + goalId));

        // Validate ownership
        if (!goal.getUser().getId().equals(userId)) {
            throw new GoalException("Goal does not belong to user ID: " + userId);
        }

        // Validate goal type
        Goal.GoalType goalType = validateAndParseGoalType(request.getType());

        // Update goal
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setType(goalType);
        goal.setTargetDate(request.getTargetDate());

        Goal updatedGoal = goalRepository.save(goal);
        log.info("Goal updated successfully with ID: {}", updatedGoal.getId());

        return buildGoalResponse(updatedGoal);
    }

    @Override
    public GoalResponse getGoalById(Long userId, Long goalId) {
        log.debug("Fetching goal ID: {} for user ID: {}", goalId, userId);

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new GoalException("Goal not found with ID: " + goalId));

        // Validate ownership
        if (!goal.getUser().getId().equals(userId)) {
            throw new GoalException("Goal does not belong to user ID: " + userId);
        }

        return buildGoalResponse(goal);
    }

    @Override
    public List<GoalResponse> getAllGoalsByUser(Long userId) {
        log.debug("Fetching all goals for user ID: {}", userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GoalException("User not found with ID: " + userId));

        List<Goal> goals = goalRepository.findByUserOrderByCreatedAtDesc(user);
        log.info("Found {} goals for user ID: {}", goals.size(), userId);

        return goals.stream()
                .map(this::buildGoalResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GoalResponse> getGoalsByStatus(Long userId, String status) {
        log.debug("Fetching goals with status: {} for user ID: {}", status, userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GoalException("User not found with ID: " + userId));

        // Validate status
        Goal.GoalStatus goalStatus = validateAndParseGoalStatus(status);

        List<Goal> goals = goalRepository.findByUserAndStatusOrderByCreatedAtDesc(user, goalStatus);
        log.info("Found {} goals with status {} for user ID: {}", goals.size(), status, userId);

        return goals.stream()
                .map(this::buildGoalResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GoalResponse> getGoalsByType(Long userId, String type) {
        log.debug("Fetching goals with type: {} for user ID: {}", type, userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GoalException("User not found with ID: " + userId));

        // Validate type
        Goal.GoalType goalType = validateAndParseGoalType(type);

        List<Goal> goals = goalRepository.findByUserAndTypeOrderByCreatedAtDesc(user, goalType);
        log.info("Found {} goals with type {} for user ID: {}", goals.size(), type, userId);

        return goals.stream()
                .map(this::buildGoalResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteGoal(Long userId, Long goalId) {
        log.info("Deleting goal ID: {} for user ID: {}", goalId, userId);

        // Find existing goal
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new GoalException("Goal not found with ID: " + goalId));

        // Validate ownership
        if (!goal.getUser().getId().equals(userId)) {
            throw new GoalException("Goal does not belong to user ID: " + userId);
        }

        goalRepository.delete(goal);
        log.info("Goal deleted successfully with ID: {}", goalId);
    }

    @Override
    public GoalResponse updateGoalProgress(Long userId, Long goalId, Double amount) {
        log.info("Updating progress for goal ID: {} for user ID: {} with amount: {}", goalId, userId, amount);

        // Find existing goal
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new GoalException("Goal not found with ID: " + goalId));

        // Validate ownership
        if (!goal.getUser().getId().equals(userId)) {
            throw new GoalException("Goal does not belong to user ID: " + userId);
        }

        // Update current amount
        goal.setCurrentAmount(amount);

        // Check if goal is completed
        if (amount >= goal.getTargetAmount() && goal.getStatus() == Goal.GoalStatus.ACTIVE) {
            goal.setStatus(Goal.GoalStatus.COMPLETED);
            log.info("Goal completed! ID: {}", goalId);
        }

        Goal updatedGoal = goalRepository.save(goal);
        log.info("Goal progress updated successfully with ID: {}", updatedGoal.getId());

        return buildGoalResponse(updatedGoal);
    }

    @Override
    public GoalResponse updateGoalStatus(Long userId, Long goalId, String status) {
        log.info("Updating status for goal ID: {} for user ID: {} to status: {}", goalId, userId, status);

        // Find existing goal
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new GoalException("Goal not found with ID: " + goalId));

        // Validate ownership
        if (!goal.getUser().getId().equals(userId)) {
            throw new GoalException("Goal does not belong to user ID: " + userId);
        }

        // Validate status
        Goal.GoalStatus goalStatus = validateAndParseGoalStatus(status);

        // Update status
        goal.setStatus(goalStatus);

        Goal updatedGoal = goalRepository.save(goal);
        log.info("Goal status updated successfully with ID: {}", updatedGoal.getId());

        return buildGoalResponse(updatedGoal);
    }

    // Helper methods
    private Goal.GoalType validateAndParseGoalType(String type) {
        try {
            return Goal.GoalType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new GoalException("Invalid goal type: " + type);
        }
    }

    private Goal.GoalStatus validateAndParseGoalStatus(String status) {
        try {
            return Goal.GoalStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new GoalException("Invalid goal status: " + status);
        }
    }

    private GoalResponse buildGoalResponse(Goal goal) {
        // Calculate progress percentage
        double progressPercentage = (goal.getCurrentAmount() / goal.getTargetAmount()) * 100;
        
        // Calculate days remaining
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
        
        // Determine progress status
        String progressStatus = determineProgressStatus(goal, progressPercentage, daysRemaining);

        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .type(goal.getType().name())
                .typeDisplayName(goal.getType().getDisplayName())
                .status(goal.getStatus().name())
                .statusDisplayName(goal.getStatus().getDisplayName())
                .targetDate(goal.getTargetDate())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .progressPercentage(Math.round(progressPercentage * 100.0) / 100.0)
                .daysRemaining(daysRemaining)
                .progressStatus(progressStatus)
                .build();
    }

    private String determineProgressStatus(Goal goal, double progressPercentage, long daysRemaining) {
        if (goal.getStatus() == Goal.GoalStatus.COMPLETED) {
            return "completed";
        }
        
        if (goal.getStatus() == Goal.GoalStatus.CANCELLED || goal.getStatus() == Goal.GoalStatus.PAUSED) {
            return "paused";
        }

        // Calculate expected progress based on time elapsed
        long totalDays = ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), goal.getTargetDate());
        long daysElapsed = totalDays - daysRemaining;
        
        if (totalDays <= 0) {
            return progressPercentage >= 100 ? "completed" : "behind";
        }
        
        double expectedProgress = (double) daysElapsed / totalDays * 100;
        
        if (progressPercentage >= 100) {
            return "completed";
        } else if (progressPercentage >= expectedProgress + 10) {
            return "ahead";
        } else if (progressPercentage < expectedProgress - 10) {
            return "behind";
        } else {
            return "on-track";
        }
    }
}


