package com.example.user.userservice.entity;


import java.time.LocalTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is mandatory")
    @Size(min = 2, message = "Name should have at least 2 characters")
    private String name;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is mandatory")
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
    
    @Size(min = 10, message = "Phone number should be 10 digits")
    private String phoneNumber;
    
    @Column(name = "login_provider")
    private String loginProvider;
    
    @Column(name = "email_verified")
    private Boolean verified = false;
    
    // Custom getter to maintain compatibility with existing code
    public boolean isVerified() {
        return verified != null && verified;
    }
    
    @Column(name = "email_schedule_enabled")
    private Boolean emailScheduleEnabled = false;
    
    // Custom getter to maintain compatibility with existing code
    public boolean isEmailScheduleEnabled() {
        return emailScheduleEnabled != null && emailScheduleEnabled;
    }


    @Column(name = "email_schedule_time")
    private LocalTime emailScheduleTime;
}
