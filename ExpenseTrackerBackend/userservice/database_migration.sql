its getting c-- Migration script to update receipts table for base64 image storage
-- Run this SQL command in your database to fix the "Data too long for column 'image_url'" error

ALTER TABLE receipts MODIFY COLUMN image_url TEXT NOT NULL;

-- Optional: Add an index for better performance if needed
-- CREATE INDEX idx_receipts_user_id ON receipts(user_id);
-- CREATE INDEX idx_receipts_status ON receipts(status);
