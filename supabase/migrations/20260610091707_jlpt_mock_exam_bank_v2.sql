-- JLPT Mock Exam Bank v2
-- Creates the normalized question bank, exam template tables, user session
-- tracking, and the public storage bucket used by exam audio/visual assets.

-- ---------------------------------------------------------------------------
-- Supabase Storage bucket for JLPT exam assets
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exam-assets',
  'exam-assets',
  true,
  52428800,
  ARRAY[
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow public read access to exam-assets'
  ) THEN
    CREATE POLICY "Allow public read access to exam-assets"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'exam-assets');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Shared constraints
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jlpt_exam_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  jlpt_level text NOT NULL CHECK (jlpt_level = ANY (ARRAY['N5', 'N4', 'N3', 'N2', 'N1'])),
  time_limit_minutes integer NOT NULL CHECK (time_limit_minutes > 0),
  passing_score integer NOT NULL DEFAULT 90 CHECK (passing_score >= 0),
  is_published boolean NOT NULL DEFAULT false,
  generation_mode text NOT NULL DEFAULT 'fixed' CHECK (generation_mode = ANY (ARRAY['fixed', 'random_by_quota'])),
  quota_config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(quota_config) = 'object'),
  category_id uuid REFERENCES public.course_categories(id) ON DELETE SET NULL,
  legacy_sanity_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jlpt_passages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  jlpt_level text NOT NULL CHECK (jlpt_level = ANY (ARRAY['N5', 'N4', 'N3', 'N2', 'N1'])),
  session_type text NOT NULL CHECK (session_type = ANY (ARRAY['vocabulary', 'grammar', 'reading', 'listening'])),
  mondai_number integer CHECK (mondai_number IS NULL OR mondai_number > 0),
  title text,
  content_html text,
  transcript_html text,
  audio_path text,
  visual_path text,
  source_label text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jlpt_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  jlpt_level text NOT NULL CHECK (jlpt_level = ANY (ARRAY['N5', 'N4', 'N3', 'N2', 'N1'])),
  session_type text NOT NULL CHECK (session_type = ANY (ARRAY['vocabulary', 'grammar', 'reading', 'listening'])),
  mondai_number integer NOT NULL CHECK (mondai_number > 0),
  question_number integer CHECK (question_number IS NULL OR question_number > 0),
  passage_id uuid REFERENCES public.jlpt_passages(id) ON DELETE SET NULL,
  prompt_html text,
  visual_path text,
  audio_path text,
  choices jsonb NOT NULL CHECK (jsonb_typeof(choices) = 'array'),
  correct_choice_index integer NOT NULL CHECK (correct_choice_index >= 0),
  explanation_html text,
  difficulty integer CHECK (difficulty IS NULL OR difficulty BETWEEN 1 AND 5),
  source_type text CHECK (
    source_type IS NULL
    OR source_type = ANY (ARRAY['vocab', 'grammar', 'kanji', 'listening', 'reading', 'custom'])
  ),
  source_id text,
  source_reference text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT jlpt_questions_choices_min_length CHECK (jsonb_array_length(choices) >= 2),
  CONSTRAINT jlpt_questions_correct_choice_in_range CHECK (correct_choice_index < jsonb_array_length(choices))
);

CREATE TABLE IF NOT EXISTS public.jlpt_exam_template_questions (
  template_id uuid NOT NULL REFERENCES public.jlpt_exam_templates(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.jlpt_questions(id) ON DELETE RESTRICT,
  position integer NOT NULL CHECK (position > 0),
  section_order integer NOT NULL DEFAULT 0 CHECK (section_order >= 0),
  PRIMARY KEY (template_id, question_id),
  UNIQUE (template_id, position)
);

CREATE TABLE IF NOT EXISTS public.user_exam_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.jlpt_exam_templates(id) ON DELETE SET NULL,
  jlpt_level text NOT NULL CHECK (jlpt_level = ANY (ARRAY['N5', 'N4', 'N3', 'N2', 'N1'])),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status = ANY (ARRAY['in_progress', 'completed', 'abandoned'])),
  question_order uuid[] NOT NULL DEFAULT '{}'::uuid[],
  payload_snapshot jsonb NOT NULL,
  answers_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(answers_snapshot) = 'object'),
  score_breakdown jsonb,
  total_score integer CHECK (total_score IS NULL OR total_score >= 0),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_exam_answers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.user_exam_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.jlpt_questions(id) ON DELETE RESTRICT,
  selected_choice_index integer CHECK (selected_choice_index IS NULL OR selected_choice_index >= 0),
  is_correct boolean NOT NULL DEFAULT false,
  answered_at timestamptz,
  UNIQUE (session_id, question_id)
);

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS update_jlpt_exam_templates_updated_at ON public.jlpt_exam_templates;
CREATE TRIGGER update_jlpt_exam_templates_updated_at
  BEFORE UPDATE ON public.jlpt_exam_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_jlpt_passages_updated_at ON public.jlpt_passages;
CREATE TRIGGER update_jlpt_passages_updated_at
  BEFORE UPDATE ON public.jlpt_passages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_jlpt_questions_updated_at ON public.jlpt_questions;
CREATE TRIGGER update_jlpt_questions_updated_at
  BEFORE UPDATE ON public.jlpt_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_user_exam_sessions_updated_at ON public.user_exam_sessions;
CREATE TRIGGER update_user_exam_sessions_updated_at
  BEFORE UPDATE ON public.user_exam_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_jlpt_exam_templates_published_slug
  ON public.jlpt_exam_templates(slug)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_jlpt_exam_templates_category_id
  ON public.jlpt_exam_templates(category_id);

CREATE INDEX IF NOT EXISTS idx_jlpt_passages_level_session_mondai
  ON public.jlpt_passages(jlpt_level, session_type, mondai_number)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_jlpt_questions_level_session_mondai
  ON public.jlpt_questions(jlpt_level, session_type, mondai_number)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_jlpt_questions_passage_id
  ON public.jlpt_questions(passage_id);

CREATE INDEX IF NOT EXISTS idx_jlpt_questions_source
  ON public.jlpt_questions(source_type, source_id)
  WHERE source_type IS NOT NULL AND source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jlpt_exam_template_questions_template_position
  ON public.jlpt_exam_template_questions(template_id, position);

CREATE INDEX IF NOT EXISTS idx_user_exam_sessions_user_status_started
  ON public.user_exam_sessions(user_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_exam_sessions_template_id
  ON public.user_exam_sessions(template_id);

CREATE INDEX IF NOT EXISTS idx_user_exam_answers_session_id
  ON public.user_exam_answers(session_id);

CREATE INDEX IF NOT EXISTS idx_user_exam_answers_question_id
  ON public.user_exam_answers(question_id);

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------

ALTER TABLE public.jlpt_exam_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jlpt_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jlpt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jlpt_exam_template_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_answers ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.jlpt_exam_templates TO anon, authenticated;
GRANT SELECT ON public.jlpt_passages TO anon, authenticated;
GRANT SELECT ON public.jlpt_questions TO anon, authenticated;
GRANT SELECT ON public.jlpt_exam_template_questions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_exam_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_exam_answers TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'jlpt_exam_templates'
      AND policyname = 'Allow public read access for published jlpt exam templates'
  ) THEN
    CREATE POLICY "Allow public read access for published jlpt exam templates"
      ON public.jlpt_exam_templates FOR SELECT
      USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'jlpt_passages'
      AND policyname = 'Allow public read access for published jlpt passages'
  ) THEN
    CREATE POLICY "Allow public read access for published jlpt passages"
      ON public.jlpt_passages FOR SELECT
      USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'jlpt_questions'
      AND policyname = 'Allow public read access for published jlpt questions'
  ) THEN
    CREATE POLICY "Allow public read access for published jlpt questions"
      ON public.jlpt_questions FOR SELECT
      USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'jlpt_exam_template_questions'
      AND policyname = 'Allow public read access for published jlpt template questions'
  ) THEN
    CREATE POLICY "Allow public read access for published jlpt template questions"
      ON public.jlpt_exam_template_questions FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.jlpt_exam_templates template
          JOIN public.jlpt_questions question
            ON question.id = public.jlpt_exam_template_questions.question_id
          WHERE template.id = public.jlpt_exam_template_questions.template_id
            AND template.is_published = true
            AND question.is_published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_exam_sessions'
      AND policyname = 'Users can view their own exam sessions'
  ) THEN
    CREATE POLICY "Users can view their own exam sessions"
      ON public.user_exam_sessions FOR SELECT
      USING ((select auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_exam_sessions'
      AND policyname = 'Users can insert their own exam sessions'
  ) THEN
    CREATE POLICY "Users can insert their own exam sessions"
      ON public.user_exam_sessions FOR INSERT
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_exam_sessions'
      AND policyname = 'Users can update their own exam sessions'
  ) THEN
    CREATE POLICY "Users can update their own exam sessions"
      ON public.user_exam_sessions FOR UPDATE
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_exam_answers'
      AND policyname = 'Users can view answers for their own exam sessions'
  ) THEN
    CREATE POLICY "Users can view answers for their own exam sessions"
      ON public.user_exam_answers FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_exam_sessions exam_session
          WHERE exam_session.id = public.user_exam_answers.session_id
            AND exam_session.user_id = (select auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_exam_answers'
      AND policyname = 'Users can insert answers for their own exam sessions'
  ) THEN
    CREATE POLICY "Users can insert answers for their own exam sessions"
      ON public.user_exam_answers FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.user_exam_sessions exam_session
          WHERE exam_session.id = public.user_exam_answers.session_id
            AND exam_session.user_id = (select auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_exam_answers'
      AND policyname = 'Users can update answers for their own exam sessions'
  ) THEN
    CREATE POLICY "Users can update answers for their own exam sessions"
      ON public.user_exam_answers FOR UPDATE
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_exam_sessions exam_session
          WHERE exam_session.id = public.user_exam_answers.session_id
            AND exam_session.user_id = (select auth.uid())
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.user_exam_sessions exam_session
          WHERE exam_session.id = public.user_exam_answers.session_id
            AND exam_session.user_id = (select auth.uid())
        )
      );
  END IF;
END $$;
