-- Add correct_count column to words table for tracking practice progress
ALTER TABLE words ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;
