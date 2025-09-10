package com.example.user.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerificationResponseDTO {
    private boolean success;
    private String message;
}