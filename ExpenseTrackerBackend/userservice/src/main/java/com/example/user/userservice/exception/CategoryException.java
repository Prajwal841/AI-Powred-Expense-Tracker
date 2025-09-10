package com.example.user.userservice.exception;

public class CategoryException extends RuntimeException {
    
    public CategoryException(String message) {
        super(message);
    }
    
    public CategoryException(String message, Throwable cause) {
        super(message, cause);
    }
}
