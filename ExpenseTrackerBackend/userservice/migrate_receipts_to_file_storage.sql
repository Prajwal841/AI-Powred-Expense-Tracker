-- Migration script to update receipts table for file storage
-- This script changes the image_url column from TEXT to VARCHAR for file paths

-- Check current schema
DESCRIBE receipts;

-- Backup existing data (optional - for safety)
-- CREATE TABLE receipts_backup AS SELECT * FROM receipts;

-- Modify image_url column to VARCHAR for file paths
-- First, we need to clear existing base64 data since it's too large for VARCHAR
UPDATE receipts SET image_url = NULL WHERE image_url IS NOT NULL;

-- Now change the column type to allow NULL values
ALTER TABLE receipts MODIFY COLUMN image_url VARCHAR(500) NULL;

-- Verify the change
DESCRIBE receipts;

-- Check the updated table
SELECT id, fileName, image_url, status FROM receipts ORDER BY id DESC LIMIT 10;

-- Optional: Add index for better performance
-- CREATE INDEX idx_receipts_user_id ON receipts(user_id);
-- CREATE INDEX idx_receipts_status ON receipts(status);
