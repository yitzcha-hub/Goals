-- =============================================================================
-- Invite codes migration (database-only changes)
-- Run this in Supabase SQL Editor if you already have the rest of the schema
-- and only want to add invite codes support.
-- =============================================================================

-- Tables
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  label text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_lifetime boolean NOT NULL DEFAULT true,
  uses_remaining integer,
  used_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invite_code_redemptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code_id uuid NOT NULL REFERENCES public.invite_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invite_code_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_assigned_to ON public.invite_codes(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invite_code_redemptions_invite_code_id ON public.invite_code_redemptions(invite_code_id);

-- RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read invite_codes assigned to them"
  ON public.invite_codes FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "Users can read own invite_code_redemptions"
  ON public.invite_code_redemptions FOR SELECT
  USING (user_id = auth.uid());

-- Trigger (requires public.set_updated_at to exist)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_invite_codes_updated_at ON public.invite_codes;
CREATE TRIGGER set_invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Grants (so anon/authenticated can use tables; RLS restricts rows)
GRANT ALL ON public.invite_codes TO anon, authenticated;
GRANT ALL ON public.invite_code_redemptions TO anon, authenticated;
