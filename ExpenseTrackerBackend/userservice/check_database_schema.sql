-- Check current database schema for receipts table
-- Run this to see the current column definitions

DESCRIBE receipts;

-- Or for MySQL/MariaDB:
-- SHOW COLUMNS FROM receipts;

-- Check if there are any receipts with NULL image_url
SELECT id, fileName, LENGTH(image_url) as image_url_length, 
       CASE WHEN image_url IS NULL THEN 'NULL' ELSE 'NOT NULL' END as image_url_status
FROM receipts 
WHERE user_id = 8 
ORDER BY id DESC 
LIMIT 10;

-- Check the data type of image_url column
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'receipts' AND COLUMN_NAME = 'image_url';
