-- Advisor follow-ups for JLPT Mock Exam Bank v2.
-- Keeps the schema additive while tightening storage/listing and user-owned
-- RLS policies after the first Phase 1 migration.

DROP POLICY IF EXISTS "Allow public read access to exam-assets" ON storage.objects;

CREATE INDEX IF NOT EXISTS idx_jlpt_exam_template_questions_question_id
  ON public.jlpt_exam_template_questions(question_id);

DROP POLICY IF EXISTS "Users can view their own exam sessions" ON public.user_exam_sessions;
DROP POLICY IF EXISTS "Users can insert their own exam sessions" ON public.user_exam_sessions;
DROP POLICY IF EXISTS "Users can update their own exam sessions" ON public.user_exam_sessions;

CREATE POLICY "Users can view their own exam sessions"
  ON public.user_exam_sessions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own exam sessions"
  ON public.user_exam_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own exam sessions"
  ON public.user_exam_sessions
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view answers for their own exam sessions" ON public.user_exam_answers;
DROP POLICY IF EXISTS "Users can insert answers for their own exam sessions" ON public.user_exam_answers;
DROP POLICY IF EXISTS "Users can update answers for their own exam sessions" ON public.user_exam_answers;

CREATE POLICY "Users can view answers for their own exam sessions"
  ON public.user_exam_answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_exam_sessions exam_session
      WHERE exam_session.id = public.user_exam_answers.session_id
        AND exam_session.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert answers for their own exam sessions"
  ON public.user_exam_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_exam_sessions exam_session
      WHERE exam_session.id = public.user_exam_answers.session_id
        AND exam_session.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update answers for their own exam sessions"
  ON public.user_exam_answers
  FOR UPDATE
  TO authenticated
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
