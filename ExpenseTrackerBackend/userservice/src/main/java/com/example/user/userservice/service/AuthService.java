package com.example.user.userservice.service;

import com.example.user.userservice.dto.AuthResponse;
import com.example.user.userservice.dto.EmailSchedulerRequest;
import com.example.user.userservice.dto.GoogleLoginRequest;
import com.example.user.userservice.dto.LoginRequest;
import com.example.user.userservice.dto.RegisterRequest;
import com.example.user.userservice.dto.UserProfileDTO;
import com.example.user.userservice.dto.UserUpdateRequest;
import com.example.user.userservice.dto.VerificationResponseDTO;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileDTO getUserProfile(Long userId);
    AuthResponse googleLogin(GoogleLoginRequest request);
    VerificationResponseDTO verifyEmail(String token);
    String updateUserProfile(Long userId, UserUpdateRequest request);
    String resendVerification(String email);

    String updateEmailScheduler(Long userId, EmailSchedulerRequest request);



}
