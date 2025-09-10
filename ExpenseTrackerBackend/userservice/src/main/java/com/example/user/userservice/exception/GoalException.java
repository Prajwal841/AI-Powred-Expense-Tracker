package com.example.user.userservice.exception;

public class GoalException extends RuntimeException {
    
    public GoalException(String message) {
        super(message);
    }
    
    public GoalException(String message, Throwable cause) {
        super(message, cause);
    }
}


