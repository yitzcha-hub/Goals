-- Add status column to manifestation_goals: active (default), paused, completed
-- Run this migration if your database was created before status was added.

ALTER TABLE public.manifestation_goals
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'paused', 'completed'));

-- Optional: add a comment for documentation
COMMENT ON COLUMN public.manifestation_goals.status IS 'Goal lifecycle: active = working on it; paused = shelved; completed = done';
