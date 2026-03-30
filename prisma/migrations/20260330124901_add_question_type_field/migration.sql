-- AlterTable: Add questionType field to Question table
-- Step 1: Add the column with a default value
ALTER TABLE `Question` ADD COLUMN `questionType` ENUM('MCQ', 'FILL_BLANK', 'SORT_ORDER', 'MATCHING', 'VISUAL_MCQ', 'CLOCK_READ') NOT NULL DEFAULT 'MCQ';

-- Step 2: Update existing questions to have questionType = 'MCQ' (already done by default)
-- This ensures all existing questions are explicitly set to MCQ type
UPDATE `Question` SET `questionType` = 'MCQ' WHERE `questionType` IS NULL OR `questionType` = '';
