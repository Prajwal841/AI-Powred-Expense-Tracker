package com.example.user.userservice.dto;

import java.time.LocalTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalTime emailScheduleTime;
    private boolean emailScheduleEnabled;
}
