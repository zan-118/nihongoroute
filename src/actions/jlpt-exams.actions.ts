"use server";

import { randomUUID } from "crypto";
import type { PostgrestError } from "@supabase/supabase-js";
import type { ExamData } from "@/components/features/exams/mock-engine/types";
import {
  EXAM_ASSETS_BUCKET,
  buildJlptSrsUpsertRows,
  buildRandomTemplateQuestionRows,
  buildSupabaseExamPackage,
  calculateJlptExamSubmission,
  getJlptQuotaRequests,
  normalizeJlptLevel,
  packageSnapshotToLegacyExam,
  packageSnapshotToSupabasePackage,
  storedScoreSnapshotToResult,
  toExamSubmitResult,
  toScoreBreakdownSnapshot,
  type ExamSubmitResult,
  type JlptExamTemplateRow,
  type JlptLevel,
  type JlptQuestionRow,
  type JlptTemplateQuestionRow,
} from "@/lib/exams/jlpt-session";
import { toLegacyExamData, type SupabaseExamSection } from "@/lib/exams/supabase-adapter";
import { createClient, createStaticClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase.generated";

type StartJlptMockSessionInput = {
  templateSlug?: string;
  jlptLevel?: JlptLevel;
};

type StartJlptMockSessionResult = {
  sessionId: string;
  exam: ExamData;
};

type ExamSessionPackageResult = {
  sessionId: string;
  status: string;
  exam: ExamData;
  result: ExamSubmitResult | null;
};

type SaveJlptMockSessionAnswersResult = {
  saved: boolean;
};

type SupabaseExamListItem = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  levelCode: string;
  timeLimit: number;
  passingScore: number;
  source: "supabase";
};

const TEMPLATE_SELECT = `
  id,
  slug,
  title,
  description,
  jlpt_level,
  time_limit_minutes,
  passing_score,
  is_published,
  generation_mode,
  quota_config,
  category_id,
  legacy_sanity_id,
  created_at,
  updated_at,
  category:course_categories(slug)
`;

const TEMPLATE_QUESTION_SELECT = `
  position,
  section_order,
  question:jlpt_questions!inner(
    id,
    jlpt_level,
    session_type,
    mondai_number,
    question_number,
    passage_id,
    prompt_html,
    visual_path,
    audio_path,
    choices,
    correct_choice_index,
    explanation_html,
    difficulty,
    source_type,
    source_id,
    source_reference,
    is_published,
    created_at,
    updated_at,
    passage:jlpt_passages(
      id,
      jlpt_level,
      session_type,
      mondai_number,
      title,
      content_html,
      transcript_html,
      audio_path,
      visual_path,
      source_label,
      is_published,
      created_at,
      updated_at
    )
  )
`;

const RANDOM_QUESTION_SELECT = `
  id,
  jlpt_level,
  session_type,
  mondai_number,
  question_number,
  passage_id,
  prompt_html,
  visual_path,
  audio_path,
  choices,
  correct_choice_index,
  explanation_html,
  difficulty,
  source_type,
  source_id,
  source_reference,
  is_published,
  created_at,
  updated_at,
  passage:jlpt_passages(
    id,
    jlpt_level,
    session_type,
    mondai_number,
    title,
    content_html,
    transcript_html,
    audio_path,
    visual_path,
    source_label,
    is_published,
    created_at,
    updated_at
  )
`;

function getSupabaseErrorMessage(error: PostgrestError | null) {
  return error?.message || "Terjadi kesalahan saat mengakses Supabase.";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function toSupabaseExamListItem(
  template: JlptExamTemplateRow
): SupabaseExamListItem {
  return {
    id: template.slug,
    slug: template.slug,
    title: template.title,
    description: template.description,
    levelCode: template.jlpt_level,
    timeLimit: template.time_limit_minutes,
    passingScore: template.passing_score,
    source: "supabase",
  };
}

function maskLegacyExamAnswers(exam: ExamData): ExamData {
  return {
    ...exam,
    questions: exam.questions.map((question) => ({
      ...question,
      correctAnswer: -1,
    })),
  };
}

function isJsonRecord(value: Json): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSavedAnswers(value: Json): Record<string, number> {
  if (!isJsonRecord(value)) return {};

  return Object.entries(value).reduce<Record<string, number>>(
    (answers, [questionId, selectedChoiceIndex]) => {
      if (Number.isInteger(selectedChoiceIndex)) {
        answers[questionId] = selectedChoiceIndex as number;
      }

      return answers;
    },
    {}
  );
}

function normalizePartialAnswers(
  examPackage: ReturnType<typeof packageSnapshotToSupabasePackage>,
  submittedAnswers: Record<string, number | null>
) {
  return examPackage.questions.reduce<Record<string, number>>((answers, question) => {
    const selectedChoiceIndex = submittedAnswers[question.id];

    if (!Number.isInteger(selectedChoiceIndex)) {
      return answers;
    }

    const answerIndex = selectedChoiceIndex as number;
    if (answerIndex >= 0 && answerIndex < question.choices.length) {
      answers[question.id] = answerIndex;
    }

    return answers;
  }, {});
}

function getRemainingTimeSeconds(input: {
  startedAt: string | null;
  timeLimitMinutes: number;
  hasCompletedResult: boolean;
}) {
  if (input.hasCompletedResult || !input.startedAt) return undefined;

  const startedAtMs = new Date(input.startedAt).getTime();
  if (!Number.isFinite(startedAtMs)) return undefined;

  const totalSeconds = input.timeLimitMinutes * 60;
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - startedAtMs) / 1000)
  );

  return Math.max(0, totalSeconds - elapsedSeconds);
}

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Kamu perlu login untuk memulai atau mengirim mock test.");
  }

  return { supabase, user };
}

function createAssetUrlResolver(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createStaticClient>
) {
  return (objectPath: string) =>
    supabase.storage.from(EXAM_ASSETS_BUCKET).getPublicUrl(objectPath).data
      .publicUrl;
}

async function getPublishedTemplate(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createStaticClient>,
  input: StartJlptMockSessionInput
) {
  let query = supabase
    .from("jlpt_exam_templates")
    .select(TEMPLATE_SELECT)
    .eq("is_published", true);

  if (input.templateSlug) {
    const templateKey = input.templateSlug.trim();
    query = isUuid(templateKey)
      ? query.or(`slug.eq.${templateKey},id.eq.${templateKey}`)
      : query.eq("slug", templateKey);
  } else {
    const level = normalizeJlptLevel(input.jlptLevel);
    if (!level) {
      throw new Error("Pilih template slug atau level JLPT yang valid.");
    }
    query = query.eq("jlpt_level", level).order("created_at", {
      ascending: false,
    });
  }

  const { data, error } = input.templateSlug
    ? await query.maybeSingle()
    : await query.limit(1).maybeSingle();

  if (error) throw new Error(getSupabaseErrorMessage(error));
  if (!data) throw new Error("Template mock test Supabase tidak ditemukan.");

  return data as JlptExamTemplateRow;
}

async function getFixedTemplateQuestions(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createStaticClient>,
  templateId: string
) {
  const { data, error } = await supabase
    .from("jlpt_exam_template_questions")
    .select(TEMPLATE_QUESTION_SELECT)
    .eq("template_id", templateId)
    .eq("question.is_published", true)
    .order("section_order", { ascending: true })
    .order("position", { ascending: true });

  if (error) throw new Error(getSupabaseErrorMessage(error));
  if (!data || data.length === 0) {
    throw new Error("Template mock test belum memiliki soal published.");
  }

  return data as unknown as JlptTemplateQuestionRow[];
}

async function getRandomTemplateQuestions(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createStaticClient>,
  template: JlptExamTemplateRow
) {
  const quotaRequests = getJlptQuotaRequests(template.quota_config, template.slug);
  const questionsBySection: Partial<Record<SupabaseExamSection, JlptQuestionRow[]>> = {};

  for (const { section } of quotaRequests) {
    const { data, error } = await supabase
      .from("jlpt_questions")
      .select(RANDOM_QUESTION_SELECT)
      .eq("is_published", true)
      .eq("jlpt_level", template.jlpt_level)
      .eq("session_type", section);

    if (error) throw new Error(getSupabaseErrorMessage(error));

    questionsBySection[section] = (data || []) as unknown as JlptQuestionRow[];
  }

  return buildRandomTemplateQuestionRows({
    quotaRequests,
    questionsBySection,
    templateSlug: template.slug,
  });
}

async function buildPublishedPackage(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createStaticClient>,
  input: StartJlptMockSessionInput
) {
  const template = await getPublishedTemplate(supabase, input);
  const templateQuestions =
    template.generation_mode === "random_by_quota"
      ? await getRandomTemplateQuestions(supabase, template)
      : await getFixedTemplateQuestions(supabase, template.id);

  return buildSupabaseExamPackage(
    template,
    templateQuestions,
    createAssetUrlResolver(supabase)
  );
}

export async function getSupabaseExamTemplateBySlug(
  templateSlug: string
): Promise<ExamData | null> {
  if (!templateSlug.trim()) return null;

  try {
    const supabase = createStaticClient();
    const examPackage = await buildPublishedPackage(supabase, {
      templateSlug: templateSlug.trim(),
    });

    return maskLegacyExamAnswers(toLegacyExamData(examPackage));
  } catch (error) {
    console.error("Gagal mengambil template mock test Supabase:", error);
    return null;
  }
}

export async function getSupabaseExamTemplatesList(input?: {
  categoryId?: string | null;
  jlptLevel?: string | null;
}): Promise<SupabaseExamListItem[]> {
  try {
    const supabase = createStaticClient();
    let query = supabase
      .from("jlpt_exam_templates")
      .select(TEMPLATE_SELECT)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    const level = normalizeJlptLevel(input?.jlptLevel);

    if (input?.categoryId && level) {
      query = query.or(`category_id.eq.${input.categoryId},jlpt_level.eq.${level}`);
    } else if (input?.categoryId) {
      query = query.eq("category_id", input.categoryId);
    } else if (level) {
      query = query.eq("jlpt_level", level);
    }

    const { data, error } = await query;

    if (error) throw new Error(getSupabaseErrorMessage(error));

    return ((data || []) as unknown as JlptExamTemplateRow[]).map(
      toSupabaseExamListItem
    );
  } catch (error) {
    console.error("Gagal mengambil daftar template mock test Supabase:", error);
    return [];
  }
}

export async function startJlptMockSession(
  input: StartJlptMockSessionInput
): Promise<StartJlptMockSessionResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  const examPackage = await buildPublishedPackage(supabase, input);
  const sessionId = randomUUID();
  const payloadSnapshot = {
    ...examPackage,
    sessionId,
  };

  const { data, error } = await supabase
    .from("user_exam_sessions")
    .insert({
      id: sessionId,
      user_id: user.id,
      template_id: examPackage.templateId,
      jlpt_level: normalizeJlptLevel(examPackage.jlptLevel) ?? "N5",
      status: "in_progress",
      question_order: examPackage.questions.map((question) => question.id),
      payload_snapshot: payloadSnapshot as unknown as Json,
      answers_snapshot: {},
    })
    .select("id")
    .single();

  if (error) throw new Error(getSupabaseErrorMessage(error));

  return {
    sessionId: data.id,
    exam: maskLegacyExamAnswers(toLegacyExamData(payloadSnapshot)),
  };
}

export async function getExamSessionPackage(
  sessionId: string
): Promise<ExamSessionPackageResult | null> {
  if (!sessionId.trim()) return null;

  const { supabase } = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("user_exam_sessions")
    .select(
      "id, status, payload_snapshot, answers_snapshot, score_breakdown, started_at, completed_at"
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw new Error(getSupabaseErrorMessage(error));
  if (!data) return null;
  const result = storedScoreSnapshotToResult({
    sessionId: data.id,
    completedAt: data.completed_at,
    scoreBreakdown: data.score_breakdown,
    answersSnapshot: data.answers_snapshot,
  });
  const exam = packageSnapshotToLegacyExam(data.payload_snapshot, data.id);
  const publicExam = result ? exam : maskLegacyExamAnswers(exam);

  return {
    sessionId: data.id,
    status: data.status,
    exam: {
      ...publicExam,
      savedAnswers: normalizeSavedAnswers(data.answers_snapshot),
      remainingTimeSeconds: getRemainingTimeSeconds({
        startedAt: data.started_at,
        timeLimitMinutes: publicExam.timeLimit,
        hasCompletedResult: Boolean(result),
      }),
    },
    result,
  };
}

export async function saveJlptMockSessionAnswers(input: {
  sessionId: string;
  answers: Record<string, number | null>;
}): Promise<SaveJlptMockSessionAnswersResult> {
  if (!input.sessionId.trim()) return { saved: false };

  const { supabase } = await requireAuthenticatedUser();
  const { data: session, error: sessionError } = await supabase
    .from("user_exam_sessions")
    .select("id, status, payload_snapshot")
    .eq("id", input.sessionId)
    .maybeSingle();

  if (sessionError) throw new Error(getSupabaseErrorMessage(sessionError));
  if (!session) throw new Error("Session mock test tidak ditemukan.");
  if (session.status !== "in_progress") return { saved: false };

  const examPackage = packageSnapshotToSupabasePackage(
    session.payload_snapshot,
    session.id
  );
  const normalizedAnswers = normalizePartialAnswers(examPackage, input.answers);

  const { error: updateError } = await supabase
    .from("user_exam_sessions")
    .update({
      answers_snapshot: normalizedAnswers as unknown as Json,
    })
    .eq("id", session.id)
    .eq("status", "in_progress");

  if (updateError) throw new Error(getSupabaseErrorMessage(updateError));

  return { saved: true };
}

export async function submitJlptMockSession(input: {
  sessionId: string;
  answers: Record<string, number | null>;
}): Promise<ExamSubmitResult> {
  const { supabase, user } = await requireAuthenticatedUser();
  const { data: session, error: sessionError } = await supabase
    .from("user_exam_sessions")
    .select(
      "id, status, payload_snapshot, answers_snapshot, score_breakdown, completed_at"
    )
    .eq("id", input.sessionId)
    .maybeSingle();

  if (sessionError) throw new Error(getSupabaseErrorMessage(sessionError));
  if (!session) throw new Error("Session mock test tidak ditemukan.");

  if (session.status === "completed") {
    const storedResult = storedScoreSnapshotToResult({
      sessionId: session.id,
      completedAt: session.completed_at,
      scoreBreakdown: session.score_breakdown,
      answersSnapshot: session.answers_snapshot,
    });

    if (storedResult) return storedResult;
    throw new Error("Session sudah selesai, tetapi snapshot skor tidak valid.");
  }

  const examPackage = packageSnapshotToSupabasePackage(
    session.payload_snapshot,
    session.id
  );
  const completedAt = new Date().toISOString();
  const score = calculateJlptExamSubmission(examPackage, input.answers);
  const answerRows = score.answerRows.map((answer) => ({
    session_id: session.id,
    question_id: answer.questionId,
    selected_choice_index: answer.selectedChoiceIndex,
    is_correct: answer.isCorrect,
    answered_at: completedAt,
  }));

  const { error: answersError } = await supabase
    .from("user_exam_answers")
    .upsert(answerRows, {
      onConflict: "session_id,question_id",
    });

  if (answersError) throw new Error(getSupabaseErrorMessage(answersError));

  const srsRows = buildJlptSrsUpsertRows({
    userId: user.id,
    candidates: score.srsCandidates,
    completedAt,
  });

  if (srsRows.length > 0) {
    const { error: srsError } = await supabase.from("user_srs").upsert(srsRows, {
      onConflict: "user_id,word_id",
      ignoreDuplicates: true,
    });

    if (srsError) throw new Error(getSupabaseErrorMessage(srsError));
  }

  const { error: updateError } = await supabase
    .from("user_exam_sessions")
    .update({
      status: "completed",
      answers_snapshot: score.answers as unknown as Json,
      score_breakdown: toScoreBreakdownSnapshot(score),
      total_score: score.totalScore,
      completed_at: completedAt,
    })
    .eq("id", session.id);

  if (updateError) throw new Error(getSupabaseErrorMessage(updateError));

  return toExamSubmitResult(session.id, score, completedAt);
}

export async function getCompletedJlptMockSessionExam(
  sessionId: string
): Promise<ExamData | null> {
  const session = await getExamSessionPackage(sessionId);
  if (!session?.result) return null;

  return {
    ...session.exam,
    serverResult: session.result,
  };
}
