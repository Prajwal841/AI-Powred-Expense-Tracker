-- Update receipts table to ensure image_url column is properly configured
ALTER TABLE receipts MODIFY COLUMN image_url VARCHAR(500) NULL COMMENT 'File path to the stored image';

-- Add index for better query performance
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_created_at ON receipts(created_at);
