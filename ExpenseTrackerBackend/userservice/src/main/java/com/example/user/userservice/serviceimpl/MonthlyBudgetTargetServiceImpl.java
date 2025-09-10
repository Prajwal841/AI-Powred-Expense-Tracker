package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.dto.MonthlyBudgetTargetRequest;
import com.example.user.userservice.dto.MonthlyBudgetTargetResponse;
import com.example.user.userservice.entity.MonthlyBudgetTarget;
import com.example.user.userservice.entity.User;
import com.example.user.userservice.exception.BudgetException;
import com.example.user.userservice.repository.MonthlyBudgetTargetRepository;
import com.example.user.userservice.repository.UserRepository;
import com.example.user.userservice.service.MonthlyBudgetTargetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MonthlyBudgetTargetServiceImpl implements MonthlyBudgetTargetService {

    private final MonthlyBudgetTargetRepository targetRepository;
    private final UserRepository userRepository;

    @Override
    public MonthlyBudgetTargetResponse createOrUpdateTarget(Long userId, MonthlyBudgetTargetRequest request) {
        log.info("Creating/updating budget target for user ID: {} for month: {}", userId, request.getMonth());

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BudgetException("User not found with ID: " + userId));

        // Validate month format
        YearMonth yearMonth = validateAndParseMonth(request.getMonth());

        // Check if target already exists for this user and month
        Optional<MonthlyBudgetTarget> existingTarget = targetRepository.findByUserAndMonth(user, request.getMonth());
        
        MonthlyBudgetTarget target;
        if (existingTarget.isPresent()) {
            // Update existing target
            target = existingTarget.get();
            target.setTargetAmount(request.getTargetAmount());
            log.info("Updating existing budget target with ID: {}", target.getId());
        } else {
            // Create new target
            target = MonthlyBudgetTarget.builder()
                    .user(user)
                    .targetAmount(request.getTargetAmount())
                    .month(request.getMonth())
                    .isActive(true)
                    .build();
            log.info("Creating new budget target");
        }

        MonthlyBudgetTarget savedTarget = targetRepository.save(target);
        log.info("Budget target saved successfully with ID: {}", savedTarget.getId());

        return buildTargetResponse(savedTarget);
    }

    @Override
    public MonthlyBudgetTargetResponse getTargetByUserAndMonth(Long userId, String month) {
        log.debug("Fetching budget target for user ID: {} and month: {}", userId, month);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BudgetException("User not found with ID: " + userId));

        // Validate month format
        validateAndParseMonth(month);

        MonthlyBudgetTarget target = targetRepository.findByUserAndMonth(user, month)
                .orElseThrow(() -> new BudgetException("Budget target not found for user ID: " + userId + " and month: " + month));

        return buildTargetResponse(target);
    }

    @Override
    public Optional<MonthlyBudgetTargetResponse> getActiveTargetByUserAndMonth(Long userId, String month) {
        log.debug("Fetching active budget target for user ID: {} and month: {}", userId, month);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BudgetException("User not found with ID: " + userId));

        // Validate month format
        validateAndParseMonth(month);

        return targetRepository.findByUserAndMonthAndIsActiveTrue(user, month)
                .map(this::buildTargetResponse);
    }

    @Override
    public void deleteTarget(Long userId, Long targetId) {
        log.info("Deleting budget target ID: {} for user ID: {}", targetId, userId);

        MonthlyBudgetTarget target = targetRepository.findById(targetId)
                .orElseThrow(() -> new BudgetException("Budget target not found with ID: " + targetId));

        // Validate ownership
        if (!target.getUser().getId().equals(userId)) {
            throw new BudgetException("Budget target does not belong to user ID: " + userId);
        }

        targetRepository.delete(target);
        log.info("Budget target deleted successfully with ID: {}", targetId);
    }

    private MonthlyBudgetTargetResponse buildTargetResponse(MonthlyBudgetTarget target) {
        return MonthlyBudgetTargetResponse.builder()
                .id(target.getId())
                .userId(target.getUser().getId())
                .userName(target.getUser().getName())
                .targetAmount(target.getTargetAmount())
                .month(target.getMonth())
                .yearMonth(YearMonth.parse(target.getMonth(), DateTimeFormatter.ofPattern("yyyy-MM")))
                .isActive(target.getIsActive())
                .build();
    }

    private YearMonth validateAndParseMonth(String month) {
        try {
            return YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
        } catch (DateTimeParseException e) {
            throw new BudgetException("Invalid month format. Expected format: YYYY-MM (e.g., 2025-08)");
        }
    }
}
