package com.example.user.userservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.example.user.userservice.dto.AuthResponse;
import com.example.user.userservice.dto.EmailSchedulerRequest;
import com.example.user.userservice.dto.GoogleLoginRequest;
import com.example.user.userservice.dto.LoginRequest;
import com.example.user.userservice.dto.RegisterRequest;
import com.example.user.userservice.dto.UserProfileDTO;
import com.example.user.userservice.dto.UserUpdateRequest;
import com.example.user.userservice.dto.VerificationResponseDTO;
import com.example.user.userservice.entity.User;
import com.example.user.userservice.exception.CustomException;
import com.example.user.userservice.security.JwtTokenProvider;
import com.example.user.userservice.service.AuthService;
import com.example.user.userservice.service.EmailService;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request received for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.login(request));
    }
    @GetMapping("/verify")
    public ResponseEntity<VerificationResponseDTO> verifyEmail(@RequestParam("token") String token) {
        VerificationResponseDTO response = authService.verifyEmail(token);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam String email) {
        authService.resendVerification(email);
        return ResponseEntity.ok(Map.of("message", "Verification email sent"));
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Long id) {
        log.info("Fetching profile for user ID: {}", id);
        UserProfileDTO profile = authService.getUserProfile(id);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/{userId}/update")
    public ResponseEntity<String> updateProfile(
            @PathVariable Long userId,
            @RequestBody UserUpdateRequest request) {
        String response = authService.updateUserProfile(userId, request);
        return ResponseEntity.ok(response);
    }           
    
    @PostMapping("/auth")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody Map<String, Object> body) {
        String idToken = extractGoogleToken(body);

        log.info("Google login attempt. tokenLen={} prefix={}",
                idToken == null ? 0 : idToken.length(),
                idToken == null ? "null" : idToken.substring(0, Math.min(idToken.length(), 20)));

        debugDecodeIdToken(idToken); // TEMP DEBUG

        GoogleLoginRequest req = new GoogleLoginRequest();
        req.setIdToken(idToken);

        try {
            AuthResponse response = authService.googleLogin(req);
            return ResponseEntity.ok(response);
        } catch (CustomException ex) {
            log.warn("Google login failed: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.builder().message(ex.getMessage()).build());
        } catch (Exception ex) {
            log.error("Unexpected error during Google login", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder().message("Internal server error").build());
        }
    }
    @PutMapping("/email-scheduler")
    public ResponseEntity<String> updateEmailScheduler(@RequestHeader("X-User-Id") Long userId,
                                                       @RequestBody EmailSchedulerRequest request) {
        String message = authService.updateEmailScheduler(userId, request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/test-email")
    public ResponseEntity<Map<String, String>> testEmail(@RequestParam String email) {
        log.info("Testing email service for: {}", email);
        
        try {
            // Create a test user
            User testUser = User.builder()
                    .name("Test User")
                    .email(email)
                    .verified(false)
                    .build();
            
            // Generate a test verification token
            String testToken = jwtTokenProvider.generateVerificationToken(testUser, 24 * 60 * 60 * 1000);
            
            // Send test email
            emailService.sendVerificationEmail(testUser, testToken);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Test email sent successfully");
            response.put("email", email);
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to send test email", e);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to send test email: " + e.getMessage());
            response.put("email", email);
            response.put("status", "error");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }



    /* ===== Helpers ===== */

    private String extractGoogleToken(Map<String, Object> body) {
        Object idTok = body.get("idToken");
        if (idTok instanceof String s && !s.isBlank()) {
            return s;
        }
        Object cred = body.get("credential");
        if (cred instanceof String s2 && !s2.isBlank()) {
            log.debug("extractGoogleToken: falling back to 'credential' key.");
            return s2;
        }
        log.warn("extractGoogleToken: no idToken/credential found in body keys={}", body.keySet());
        return null;
    }
  
    /** TEMP DEBUG: decode and log payload (no signature check). */
    private void debugDecodeIdToken(String raw) {
        if (raw == null) {
            log.warn("debugDecodeIdToken: raw token null.");
            return;
        }
        String[] parts = raw.split("\\.");
        if (parts.length != 3) {
            log.warn("debugDecodeIdToken: token not JWT-shaped, parts={}", parts.length);
            return;
        }
        try {
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
            log.info("debugDecodeIdToken payload: {}", payloadJson);
        } catch (Exception e) {
            log.warn("debugDecodeIdToken: decode error {}", e.toString());
        }
    }
    
   
}
