-- Fix receipts table schema for base64 image storage
-- This script ensures the image_url column can store large base64 data

-- Check current schema
DESCRIBE receipts;

-- Modify image_url column to TEXT if it's not already
ALTER TABLE receipts MODIFY COLUMN image_url TEXT NOT NULL;

-- Verify the change
DESCRIBE receipts;

-- Check for any existing receipts with truncated image_url
SELECT id, fileName, LENGTH(image_url) as image_url_length, 
       CASE WHEN image_url IS NULL THEN 'NULL' ELSE 'NOT NULL' END as image_url_status
FROM receipts 
ORDER BY id DESC 
LIMIT 10;

-- Optional: Add index for better performance
-- CREATE INDEX idx_receipts_user_id ON receipts(user_id);
-- CREATE INDEX idx_receipts_status ON receipts(status);
