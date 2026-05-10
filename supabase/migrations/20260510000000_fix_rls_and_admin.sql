-- Fix RLS policies: lock down read/update access to authenticated admin users only.
-- Public (anon) users can only INSERT submissions, events, and feedback.
-- 
-- SETUP: After applying this migration, create an admin user:
-- 1. Sign up via the app (or create via Supabase dashboard)
-- 2. Add their user ID to the admins table:
--    INSERT INTO public.admins (user_id) VALUES ('your-admin-user-uuid');

-- Create admins table to track who has admin access
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admins table
CREATE POLICY "Admins can read admins"
  ON public.admins FOR SELECT
  USING (auth.uid() = user_id);

-- Helper function: check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

-- ═══════════════════════════════════════════════════════════
-- SUBMISSIONS: drop old wide-open policies, add restricted ones
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Submissions are readable" ON public.submissions;
DROP POLICY IF EXISTS "Submissions are updatable" ON public.submissions;

-- Admins can read all submissions
CREATE POLICY "Admins can read submissions"
  ON public.submissions FOR SELECT
  USING (public.is_admin());

-- Admins can update submissions (status, script, audio_url, etc.)
CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE
  USING (public.is_admin());

-- Keep: anyone can insert (anonymous form submissions)
-- Policy "Anyone can insert submissions" already exists

-- ═══════════════════════════════════════════════════════════
-- EVENTS: drop old wide-open SELECT, restrict to admins
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Events are readable" ON public.events;

CREATE POLICY "Admins can read events"
  ON public.events FOR SELECT
  USING (public.is_admin());

-- Keep: anyone can insert events

-- ═══════════════════════════════════════════════════════════
-- FEEDBACK: drop old wide-open SELECT, restrict to admins
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Feedback is readable" ON public.feedback;

CREATE POLICY "Admins can read feedback"
  ON public.feedback FOR SELECT
  USING (public.is_admin());

-- Keep: anyone can insert feedback
