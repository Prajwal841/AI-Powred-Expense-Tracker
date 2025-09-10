-- Fix the email_verified column to allow NULL values and set default
ALTER TABLE users MODIFY COLUMN email_verified BOOLEAN NULL DEFAULT FALSE;

-- Update any existing NULL values to FALSE
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;

-- Fix the email_schedule_enabled column to allow NULL values and set default
ALTER TABLE users MODIFY COLUMN email_schedule_enabled BOOLEAN NULL DEFAULT FALSE;

-- Update any existing NULL values to FALSE
UPDATE users SET email_schedule_enabled = FALSE WHERE email_schedule_enabled IS NULL;

-- Fix the is_active column in monthly_budget_targets table to allow NULL values and set default
ALTER TABLE monthly_budget_targets MODIFY COLUMN is_active BOOLEAN NULL DEFAULT TRUE;

-- Update any existing NULL values to TRUE
UPDATE monthly_budget_targets SET is_active = TRUE WHERE is_active IS NULL;
