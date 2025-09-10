package com.example.user.userservice.exception;

public class BudgetException extends RuntimeException {
    
    public BudgetException(String message) {
        super(message);
    }
    
    public BudgetException(String message, Throwable cause) {
        super(message, cause);
    }
}
