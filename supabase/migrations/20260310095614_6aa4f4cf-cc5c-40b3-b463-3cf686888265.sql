
-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('voice', 'text')),
  raw_text TEXT,
  voice_file_url TEXT,
  voice_file_path TEXT,
  voice_duration_seconds NUMERIC,
  voice_mime_type TEXT,
  transcript_text TEXT,
  polished_script TEXT,
  audio_url TEXT,
  audio_file_path TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'polishing', 'ready', 'sent')),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  utm_source TEXT,
  utm_campaign TEXT
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  page TEXT,
  utm_source TEXT,
  utm_campaign TEXT
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  email TEXT,
  feedback_text TEXT NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Submissions: anyone can insert (anonymous users submitting)
CREATE POLICY "Anyone can insert submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

-- Submissions: readable for admin queries
CREATE POLICY "Submissions are readable"
  ON public.submissions FOR SELECT
  USING (true);

-- Submissions: updatable for admin
CREATE POLICY "Submissions are updatable"
  ON public.submissions FOR UPDATE
  USING (true);

-- Events: anyone can insert
CREATE POLICY "Anyone can insert events"
  ON public.events FOR INSERT
  WITH CHECK (true);

-- Events: readable
CREATE POLICY "Events are readable"
  ON public.events FOR SELECT
  USING (true);

-- Feedback: anyone can insert
CREATE POLICY "Anyone can insert feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

-- Feedback: readable
CREATE POLICY "Feedback is readable"
  ON public.feedback FOR SELECT
  USING (true);

-- Storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('manifestations', 'manifestations', true);

-- Storage policies
CREATE POLICY "Anyone can upload manifestation files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'manifestations');

CREATE POLICY "Manifestation files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'manifestations');
