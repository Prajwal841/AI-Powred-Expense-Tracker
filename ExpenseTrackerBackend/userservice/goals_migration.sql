-- Goals table migration
-- Run this script to create the goals table

CREATE TABLE IF NOT EXISTS goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    type ENUM('SAVINGS', 'SPENDING_LIMIT', 'DEBT_PAYOFF', 'INVESTMENT', 'EMERGENCY_FUND', 'VACATION', 'HOME', 'CAR', 'EDUCATION', 'OTHER') NOT NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    target_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_target_date (target_date)
);

-- Add some sample goals for testing (optional)
-- INSERT INTO goals (user_id, title, description, target_amount, current_amount, type, target_date) VALUES
-- (1, 'Emergency Fund', 'Save 6 months of expenses', 50000.00, 15000.00, 'EMERGENCY_FUND', '2024-12-31'),
-- (1, 'Vacation to Europe', 'Save for summer vacation', 100000.00, 25000.00, 'VACATION', '2024-06-30'),
-- (1, 'New Car', 'Save for down payment', 200000.00, 50000.00, 'CAR', '2024-08-31');


