-- =============================================================================
-- Goals App: Fix manifestation_goals / manifestation_todos (fix 400 on insert)
-- =============================================================================
-- Run this in Supabase Dashboard → SQL Editor if you get:
--   POST .../manifestation_goals 400 (Bad Request)
-- when adding goals. It adds missing columns to existing tables.
-- Safe to run multiple times (idempotent).
-- =============================================================================

-- Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add columns to manifestation_goals if they don't exist (e.g. table was created before these were added)
ALTER TABLE public.manifestation_goals
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS steps jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS budget integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spent integer NOT NULL DEFAULT 0;

-- Add time_slot to manifestation_todos if missing
ALTER TABLE public.manifestation_todos
  ADD COLUMN IF NOT EXISTS time_slot text;

-- Ensure RLS is enabled (no-op if already on)
ALTER TABLE public.manifestation_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestation_todos ENABLE ROW LEVEL SECURITY;
