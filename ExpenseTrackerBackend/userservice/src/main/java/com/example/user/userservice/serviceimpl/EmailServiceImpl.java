package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.entity.User;
import com.example.user.userservice.exception.CustomException;
import com.example.user.userservice.service.EmailService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine; 
    

    @Value("${app.verification.base-url}")
    private String baseUrl;

    @Value("${app.mail.from:no-reply@expensetracker}")
    private String from;

    @Async
    @Override
    public void sendVerificationEmail(User user, String verificationToken) {
        log.info("🔄 Starting to send verification email to: {}", user.getEmail());
        String verifyLink = String.format("%s/api/user/verify?token=%s", baseUrl, verificationToken);
        log.info("🔗 Verification link: {}", verifyLink);

        try {
            // Prepare variables for template
            Context context = new Context();
            context.setVariable("name", Optional.ofNullable(user.getName()).orElse("there"));
            context.setVariable("verifyLink", verifyLink);
            log.info("📝 Template variables set - name: {}, verifyLink: {}", 
                    Optional.ofNullable(user.getName()).orElse("there"), verifyLink);

            String html = templateEngine.process("verification-email", context);
            log.info("📄 HTML template processed successfully, length: {}", html.length());

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(user.getEmail());
            helper.setFrom(from);
            helper.setSubject("Verify your email");
            helper.setText(html, true);
            
            log.info("📧 Email message prepared - To: {}, From: {}, Subject: Verify your email", 
                    user.getEmail(), from);

            mailSender.send(message);
            log.info("✅ Successfully sent verification email to {}", user.getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to send verification email to {}", user.getEmail(), e);
            // Log the full stack trace for debugging
            e.printStackTrace();
        }
    }

	
}

