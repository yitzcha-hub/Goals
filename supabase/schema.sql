-- =============================================================================
-- Goals App - Supabase (PostgreSQL) Schema
-- =============================================================================
-- How to run:
--   1. Open your Supabase project → SQL Editor.
--   2. Paste this entire file and click "Run".
--   3. Auth is handled by Supabase Auth (auth.users). All app data is in public.
--
-- Storage (create in Dashboard → Storage):
--   - Bucket "progress-photos" (public) for progress photos.
--   - Bucket "construction-receipts" (optional) for expense receipts.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CORE USER DATA (goals, habits, journal)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  progress integer NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  privacy text NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'public')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.habits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  frequency text NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  streak integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  mood integer CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. FORUM (categories, threads, replies, upvotes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.forum_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_threads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  upvotes integer NOT NULL DEFAULT 0,
  reply_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.thread_upvotes (
  thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3. SUBSCRIPTIONS (Stripe / trials)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'unpaid')),
  plan_name text,
  stripe_subscription_id text,
  stripe_customer_id text,
  stripe_price_id text,
  trial_start bigint,
  trial_end bigint,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  plan_amount integer,
  plan_currency text,
  plan_interval text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- =============================================================================
-- 4. REMINDERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reminder_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  goal_deadline_enabled boolean NOT NULL DEFAULT true,
  goal_deadline_timing integer NOT NULL DEFAULT 24,
  habit_checkin_enabled boolean NOT NULL DEFAULT true,
  habit_checkin_time time NOT NULL DEFAULT '09:00:00',
  family_activity_enabled boolean NOT NULL DEFAULT true,
  family_activity_timing integer NOT NULL DEFAULT 2,
  smart_reminders_enabled boolean NOT NULL DEFAULT true,
  email_enabled boolean NOT NULL DEFAULT false,
  push_enabled boolean NOT NULL DEFAULT true,
  email_address text DEFAULT '',
  fcm_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('goal_deadline', 'habit_checkin', 'family_activity', 'smart_reminder')),
  entity_id uuid NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('goal', 'habit', 'family_goal', 'family_activity')),
  reminder_time timestamptz NOT NULL,
  channels text[] DEFAULT '{}',
  frequency text,
  message text NOT NULL,
  is_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 5. GOAL COLLABORATION (collaborators, invitations, activity, tasks, comments, likes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.goal_collaborators (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  email text,
  name text,
  UNIQUE (goal_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.goal_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goal_activity (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goal_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  assigned_to uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_email text DEFAULT '',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goal_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goal_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (goal_id, user_id)
);

-- =============================================================================
-- 6. ONBOARDING
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  step_1_set_goal boolean NOT NULL DEFAULT false,
  step_2_create_task boolean NOT NULL DEFAULT false,
  step_3_habit_checkin boolean NOT NULL DEFAULT false,
  step_4_explore_analytics boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 7. VIDEO CALLS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.video_calls (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  room_id text NOT NULL,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.video_call_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id uuid NOT NULL REFERENCES public.video_calls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  left_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 8. WHITEBOARD
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.whiteboard_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Whiteboard Session',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.whiteboard_elements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES public.whiteboard_sessions(id) ON DELETE CASCADE,
  element_type text NOT NULL,
  element_data jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 9. COLLABORATION MESSAGES & TEAM ACTIVITY
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.collaboration_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 10. FAMILY GROUPS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.family_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  email text,
  UNIQUE (family_group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.family_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value integer NOT NULL DEFAULT 100,
  current_value integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'points',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  points integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  assigned_name text,
  completed_by_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'trophy',
  earned_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_member_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  tasks_completed integer NOT NULL DEFAULT 0,
  goals_contributed integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_group_id, user_id)
);

-- =============================================================================
-- 11. FITNESS, CONSTRUCTION BUDGET, PROGRESS PHOTOS, MANIFESTATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.fitness_daily_activity (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  steps integer NOT NULL DEFAULT 0,
  calories integer NOT NULL DEFAULT 0,
  distance numeric(10,2) NOT NULL DEFAULT 0,
  active_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.construction_budgets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, phase)
);

CREATE TABLE IF NOT EXISTS public.construction_expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase text NOT NULL,
  category text NOT NULL,
  amount numeric(12,2) NOT NULL,
  description text,
  date date NOT NULL,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.progress_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.goals(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.manifestation_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  timeline text NOT NULL DEFAULT '30' CHECK (timeline IN ('30', '60', '90', '1year', '5year')),
  progress integer NOT NULL DEFAULT 0,
  image_url text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  recommendations jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.manifestation_todos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.manifestation_gratitude_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.manifestation_journal_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text,
  mood text NOT NULL DEFAULT 'good' CHECK (mood IN ('great', 'good', 'okay', 'tough')),
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.manifestation_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES (for common filters and joins)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON public.goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_privacy ON public.goals(privacy) WHERE privacy = 'public';

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON public.forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON public.forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_upvotes_user_id ON public.thread_upvotes(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_time ON public.reminders(reminder_time) WHERE is_sent = false;
CREATE INDEX IF NOT EXISTS idx_reminder_preferences_user_id ON public.reminder_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_goal_collaborators_goal_id ON public.goal_collaborators(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_activity_goal_id ON public.goal_activity(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_tasks_goal_id ON public.goal_tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_comments_goal_id ON public.goal_comments(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_likes_goal_id ON public.goal_likes(goal_id);

CREATE INDEX IF NOT EXISTS idx_video_calls_goal_id ON public.video_calls(goal_id);
CREATE INDEX IF NOT EXISTS idx_video_call_participants_call_id ON public.video_call_participants(call_id);

CREATE INDEX IF NOT EXISTS idx_whiteboard_sessions_goal_id ON public.whiteboard_sessions(goal_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_elements_session_id ON public.whiteboard_elements(session_id);

CREATE INDEX IF NOT EXISTS idx_collaboration_messages_goal_id ON public.collaboration_messages(goal_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_goal_id ON public.team_activity_logs(goal_id);

CREATE INDEX IF NOT EXISTS idx_family_members_family_group_id ON public.family_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_goals_family_group_id ON public.family_goals(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_tasks_family_group_id ON public.family_tasks(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_achievements_family_group_id ON public.family_achievements(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_member_progress_family_group_id ON public.family_member_progress(family_group_id);

CREATE INDEX IF NOT EXISTS idx_fitness_daily_activity_user_date ON public.fitness_daily_activity(user_id, date);
CREATE INDEX IF NOT EXISTS idx_construction_budgets_user_id ON public.construction_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_construction_expenses_user_id ON public.construction_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_goal ON public.progress_photos(user_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_manifestation_goals_user_id ON public.manifestation_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_manifestation_todos_user_id ON public.manifestation_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_manifestation_gratitude_user_id ON public.manifestation_gratitude_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_manifestation_journal_user_id ON public.manifestation_journal_entries(user_id);

-- =============================================================================
-- RPC: decrement (used by Forums for upvote toggle)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.decrement(
  row_id uuid,
  table_name text,
  column_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = GREATEST(0, %I - 1) WHERE id = $1',
    table_name,
    column_name,
    column_name
  )
  USING row_id;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS and policies so users only access their own or permitted data.
-- =============================================================================

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_member_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestation_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestation_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestation_gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestation_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestation_stats ENABLE ROW LEVEL SECURITY;

-- Forum categories: read-only for all authenticated
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Goals: own rows by user_id; public goals readable by all
CREATE POLICY "Users can CRUD own goals"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can read public goals"
  ON public.goals FOR SELECT
  USING (privacy = 'public');

-- Habits, journal: own only
CREATE POLICY "Users can CRUD own habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own journal_entries"
  ON public.journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions, reminder_preferences, reminders, onboarding: own only
CREATE POLICY "Users can CRUD own subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own reminder_preferences"
  ON public.reminder_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own reminders"
  ON public.reminders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own onboarding_progress"
  ON public.onboarding_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Forum categories: all authenticated can read
CREATE POLICY "Authenticated can read forum_categories"
  ON public.forum_categories FOR SELECT
  TO authenticated
  USING (true);

-- Forum threads: read by all; insert/update/delete own
CREATE POLICY "Anyone can read forum_threads"
  ON public.forum_threads FOR SELECT
  USING (true);
CREATE POLICY "Authenticated can insert forum_threads"
  ON public.forum_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own forum_threads"
  ON public.forum_threads FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own forum_threads"
  ON public.forum_threads FOR DELETE
  USING (auth.uid() = user_id);

-- Thread upvotes: authenticated insert/delete own
CREATE POLICY "Authenticated can manage own thread_upvotes"
  ON public.thread_upvotes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Forum replies: read all; insert own
CREATE POLICY "Anyone can read forum_replies"
  ON public.forum_replies FOR SELECT
  USING (true);
CREATE POLICY "Authenticated can insert forum_replies"
  ON public.forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Goal collaborators, invitations, activity, tasks, comments, likes: access if owner or collaborator
-- Simplified: allow all for goal-related tables and enforce in app or add stricter policies
CREATE POLICY "Users can read goal_collaborators for goals they belong to"
  ON public.goal_collaborators FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = goal_collaborators.goal_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Goal owners can insert goal_collaborators"
  ON public.goal_collaborators FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND (g.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = g.id AND c.user_id = auth.uid()))));
CREATE POLICY "Goal owners/collaborators can update goal_collaborators"
  ON public.goal_collaborators FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Goal owners can delete goal_collaborators"
  ON public.goal_collaborators FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid()));

CREATE POLICY "Users can read goal_invitations for their goals"
  ON public.goal_invitations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid()) OR inviter_id = auth.uid());
CREATE POLICY "Goal owners can insert goal_invitations"
  ON public.goal_invitations FOR INSERT
  WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Users can read goal_activity for goals they collaborate on"
  ON public.goal_activity FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = goal_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Collaborators can insert goal_activity"
  ON public.goal_activity FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read goal_tasks for goals they collaborate on"
  ON public.goal_tasks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = goal_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Collaborators can manage goal_tasks"
  ON public.goal_tasks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = goal_id AND c.user_id = auth.uid())
  )
  WITH CHECK (true);

CREATE POLICY "Anyone can read goal_comments"
  ON public.goal_comments FOR SELECT
  USING (true);
CREATE POLICY "Authenticated can insert goal_comments"
  ON public.goal_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read goal_likes"
  ON public.goal_likes FOR SELECT
  USING (true);
CREATE POLICY "Authenticated can insert goal_likes"
  ON public.goal_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own goal_likes"
  ON public.goal_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Video calls, whiteboard, collaboration_messages, team_activity_logs: goal collaborators
CREATE POLICY "Collaborators can manage video_calls"
  ON public.video_calls FOR ALL
  USING (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND (g.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = g.id AND c.user_id = auth.uid()))))
  WITH CHECK (true);
CREATE POLICY "Collaborators can manage video_call_participants"
  ON public.video_call_participants FOR ALL
  USING (EXISTS (SELECT 1 FROM public.video_calls v JOIN public.goals g ON g.id = v.goal_id WHERE v.id = call_id AND (g.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = g.id AND c.user_id = auth.uid()))))
  WITH CHECK (true);

CREATE POLICY "Collaborators can manage whiteboard_sessions"
  ON public.whiteboard_sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND (g.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = g.id AND c.user_id = auth.uid()))))
  WITH CHECK (true);
CREATE POLICY "Collaborators can manage whiteboard_elements"
  ON public.whiteboard_elements FOR ALL
  USING (EXISTS (SELECT 1 FROM public.whiteboard_sessions w JOIN public.goals g ON g.id = w.goal_id WHERE w.id = session_id AND (g.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = g.id AND c.user_id = auth.uid()))))
  WITH CHECK (true);

CREATE POLICY "Collaborators can manage collaboration_messages"
  ON public.collaboration_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND (g.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = g.id AND c.user_id = auth.uid()))))
  WITH CHECK (true);
CREATE POLICY "Collaborators can manage team_activity_logs"
  ON public.team_activity_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND (g.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.goal_collaborators c WHERE c.goal_id = g.id AND c.user_id = auth.uid()))))
  WITH CHECK (true);

-- Family: members can read/write their group data
CREATE POLICY "Users can CRUD own family_groups"
  ON public.family_groups FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Members can read family_groups they belong to"
  ON public.family_groups FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_group_id = family_groups.id AND fm.user_id = auth.uid()));

CREATE POLICY "Members can read family_members of their group"
  ON public.family_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.family_groups fg WHERE fg.id = family_group_id AND fg.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_group_id = family_members.family_group_id AND fm.user_id = auth.uid())
  );
CREATE POLICY "Owners can insert family_members"
  ON public.family_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.family_groups fg WHERE fg.id = family_group_id AND fg.owner_id = auth.uid()));
CREATE POLICY "Owners can delete family_members"
  ON public.family_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.family_groups fg WHERE fg.id = family_group_id AND fg.owner_id = auth.uid()));

CREATE POLICY "Members can manage family_goals"
  ON public.family_goals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_group_id = family_goals.family_group_id AND fm.user_id = auth.uid()))
  WITH CHECK (true);
CREATE POLICY "Members can manage family_tasks"
  ON public.family_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_group_id = family_tasks.family_group_id AND fm.user_id = auth.uid()))
  WITH CHECK (true);
CREATE POLICY "Members can read family_achievements"
  ON public.family_achievements FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_group_id = family_achievements.family_group_id AND fm.user_id = auth.uid()));
CREATE POLICY "Members can insert family_achievements"
  ON public.family_achievements FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_group_id = family_achievements.family_group_id AND fm.user_id = auth.uid()));
CREATE POLICY "Members can manage family_member_progress"
  ON public.family_member_progress FOR ALL
  USING (EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_group_id = family_member_progress.family_group_id AND fm.user_id = auth.uid()))
  WITH CHECK (true);

-- Fitness, construction, progress_photos, manifestation: own only
CREATE POLICY "Users can CRUD own fitness_daily_activity"
  ON public.fitness_daily_activity FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own construction_budgets"
  ON public.construction_budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own construction_expenses"
  ON public.construction_expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own progress_photos"
  ON public.progress_photos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own manifestation_goals"
  ON public.manifestation_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own manifestation_todos"
  ON public.manifestation_todos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own manifestation_gratitude_entries"
  ON public.manifestation_gratitude_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own manifestation_journal_entries"
  ON public.manifestation_journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own manifestation_stats"
  ON public.manifestation_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- TRIGGER: updated_at for goals, habits, journal_entries
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS set_goals_updated_at ON public.goals;
  CREATE TRIGGER set_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  DROP TRIGGER IF EXISTS set_habits_updated_at ON public.habits;
  CREATE TRIGGER set_habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  DROP TRIGGER IF EXISTS set_journal_entries_updated_at ON public.journal_entries;
  CREATE TRIGGER set_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  DROP TRIGGER IF EXISTS set_forum_threads_updated_at ON public.forum_threads;
  CREATE TRIGGER set_forum_threads_updated_at BEFORE UPDATE ON public.forum_threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
END
$$;

-- =============================================================================
-- GRANTS (required for Supabase API: anon + authenticated can access public)
-- RLS policies above restrict which rows each role can see.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Future tables/sequences/functions get the same privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
