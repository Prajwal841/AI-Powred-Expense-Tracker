package com.example.user.userservice.serviceimpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.user.userservice.config.GoogleTokenValidator;
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
import com.example.user.userservice.repository.UserRepository;
import com.example.user.userservice.security.JwtTokenProvider;
import com.example.user.userservice.service.AuthService;
import com.example.user.userservice.service.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleTokenValidator googleTokenValidator;
     private final EmailService emailService; // <--- add this


    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new CustomException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .loginProvider("LOCAL")
                .verified(false)
                .build();

        userRepository.save(user);

        // Generate verification token
        String verificationToken = jwtTokenProvider.generateVerificationToken(user, 24 * 60 * 60 * 1000);

        // Construct link
        String verifyUrl = "http://localhost:8086/api/user/verify?token=" + verificationToken;


        // Send email (async)
        log.info("📧 Calling email service to send verification email to: {}", user.getEmail());
        emailService.sendVerificationEmail(user, verificationToken);
        log.info("📧 Email service call completed for user: {}", user.getEmail());
        log.info("🔗 Verification link: {}", verifyUrl);

        return AuthResponse.builder()
                .message("User registered successfully. Please check your email to verify your account.")
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
   



    @Override
    public AuthResponse login(LoginRequest request) {
        log.debug("Login attempt for email: {}", request.getEmail());

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            log.warn("Login failed - Email not found: {}", request.getEmail());
            throw new CustomException("Invalid email or password");
        }
        

        User user = optionalUser.get();
        
        if (!user.isVerified()) {
            throw new CustomException("Please verify your email before logging in");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed - Invalid password for email: {}", request.getEmail());
            throw new CustomException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user);
        log.info("Login successful for user: {}", user.getEmail());

        return AuthResponse.builder()
                .message("Login successful")
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
    @Override
	 public String resendVerification(String email) {
       var user = userRepository.findByEmail(email)
               .orElseThrow(() -> new CustomException("User not found"));

       if (user.isVerified()) {
           throw new CustomException("Account already verified");
       }

       String token = jwtTokenProvider.generateVerificationToken(user, 24 * 60 * 60 * 1000);
       emailService.sendVerificationEmail(user, token);
		return token;
   }
    @Override
    public VerificationResponseDTO verifyEmail(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new CustomException("Invalid or expired verification token");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found"));

        if (user.isVerified()) {
            return new VerificationResponseDTO(true, "Account already verified");
        }

        user.setVerified(true);
        userRepository.save(user);

        return new VerificationResponseDTO(true, "Email verified successfully! You can now log in.");
    }


    @Override
    public UserProfileDTO getUserProfile(Long userId) {
        log.debug("Fetching profile for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new UsernameNotFoundException("User not found");
                });

        log.info("User profile fetched for: {}", user.getEmail());

        return new UserProfileDTO(user.getId(), user.getName(), user.getEmail(), user.getPhoneNumber(),user.getEmailScheduleTime(),user.isEmailScheduleEnabled());
    }

    @Override
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        String raw = request.getIdToken();
        log.debug("AuthServiceImpl.googleLogin: validating Google ID token (len={})", raw == null ? 0 : raw.length());

        GoogleIdToken.Payload payload;
        try {
            payload = googleTokenValidator.validate(raw);
        } catch (Exception e) {
            log.error("Invalid Google ID Token", e);
            throw new CustomException("Invalid Google ID Token");
        }

        String email = payload.getEmail();
        String extractedName = (String) payload.get("name");
        if (extractedName == null) {
            String given = (String) payload.get("given_name");
            String family = (String) payload.get("family_name");
            extractedName = (given != null || family != null)
                    ? ((given == null ? "" : given) + " " + (family == null ? "" : family)).trim()
                    : email;
        }

        String phoneNumber = (String) payload.get("phone_number");
        if (phoneNumber == null) {
            phoneNumber = ""; // or leave null
        }

        final String finalName = extractedName;
        final String finalPhone = phoneNumber;

        log.debug("Google token validated. email={}, name={}, phone={}", email, finalName, finalPhone);

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Registering new Google user: {}", email);
                    String randomPassword = UUID.randomUUID().toString();
                    return userRepository.save(User.builder()
                            .email(email)
                            .name(finalName)
                            .phoneNumber(finalPhone) // ✅ Save phone if present
                            .password(passwordEncoder.encode(randomPassword))
                            .loginProvider("GOOGLE")
                            .verified(true)
                            .build());
                });

        boolean updated = false;
        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(finalName);
            updated = true;
        }
        if ((user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) && !finalPhone.isBlank()) {
            user.setPhoneNumber(finalPhone);
            updated = true;
        }
        if (updated) {
            userRepository.save(user);
            log.info("Updated missing details for user: {}", email);
        }

        String token = jwtTokenProvider.generateToken(user);

        return AuthResponse.builder()
                .message("Login successful using Google")
                .userId(user.getId())
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }

    @Override
    public String updateUserProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException("User not found"));

        // Check and restrict email change for Google login users
        if ("GOOGLE".equalsIgnoreCase(user.getLoginProvider())
                && !user.getEmail().equals(request.getEmail())) {
            return "Email cannot be changed for users logged in with Google.";
        }

        // Update name and phone number
        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());

        // Allow email update only if login provider is LOCAL
        if ("LOCAL".equalsIgnoreCase(user.getLoginProvider())) {
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);
        return "Profile updated successfully.";
    }

    @Override
    public String updateEmailScheduler(Long userId, EmailSchedulerRequest request) {
        log.info("Updating email scheduler for userId={} with enabled={}, time={}",
                userId, request.isEnabled(), request.getEmailScheduleTime());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new UsernameNotFoundException("User not found with ID: " + userId);
                });

        user.setEmailScheduleEnabled(request.isEnabled());
        user.setEmailScheduleTime(request.getEmailScheduleTime());

        userRepository.save(user);
        log.info("Email scheduler updated successfully for userId={}", userId);

        return "Email scheduler updated successfully";
    }
}


