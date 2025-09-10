package com.example.user.userservice.exception;

/**
 * Custom exception for handling application-specific errors
 */
public class CustomException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public CustomException(String message) {
        super(message);
    }

    public CustomException(String message, Throwable cause) {
        super(message, cause);
    }
}