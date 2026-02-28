-- Migration: add timings column to tutor_profiles
ALTER TABLE tutor_profiles
ADD COLUMN IF NOT EXISTS timings text;
