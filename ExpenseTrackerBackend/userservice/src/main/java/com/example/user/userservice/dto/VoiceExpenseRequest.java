package com.example.user.userservice.dto;

import lombok.Data;

@Data
public class VoiceExpenseRequest {
    private String voiceText;
    private Long userId;
}
