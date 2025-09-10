package com.example.user.userservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class EmailSchedulerRequest {
    private boolean enabled;
    private LocalTime emailScheduleTime;
}
