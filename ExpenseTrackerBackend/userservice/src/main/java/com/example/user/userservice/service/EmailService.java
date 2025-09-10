package com.example.user.userservice.service;

import com.example.user.userservice.entity.User;

public interface EmailService {
    void sendVerificationEmail(User user, String verificationToken);

}
