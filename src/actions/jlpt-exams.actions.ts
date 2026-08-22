"use server";

/**
 * @file jlpt-exams.actions.ts
 * @description Server Actions handling JLPT mock exam sessions, template retrieval, answer saving, and final submissions via exam service.
 * @module actions
 */

// Import & Dependencies

import {
 getSupabaseExamTemplateBySlug as serviceGetSupabaseExamTemplateBySlug,
 getSupabaseExamTemplatesList as serviceGetSupabaseExamTemplatesList,
 startJlptMockSession as serviceStartJlptMockSession,
 getExamSessionPackage as serviceGetExamSessionPackage,
 saveJlptMockSessionAnswers as serviceSaveJlptMockSessionAnswers,
 submitJlptMockSession as serviceSubmitJlptMockSession,
 getCompletedJlptMockSessionExam as serviceGetCompletedJlptMockSessionExam
} from "@/lib/services/exam.service";

export async function getSupabaseExamTemplateBySlug(templateSlug: string) {
 return serviceGetSupabaseExamTemplateBySlug(templateSlug);
}

export async function getSupabaseExamTemplatesList(input?: { categoryId?: string | null; jlptLevel?: string | null; }) {
 return serviceGetSupabaseExamTemplatesList(input);
}

export async function startJlptMockSession(input: { templateSlug?: string; jlptLevel?: "N5" | "N4" | "N3" | "N2" | "N1"; }) {
 return serviceStartJlptMockSession(input);
}

export async function getExamSessionPackage(sessionId: string) {
 return serviceGetExamSessionPackage(sessionId);
}

export async function saveJlptMockSessionAnswers(input: {
 sessionId: string;
 answers: Record<string, number | null>;
}) {
 return serviceSaveJlptMockSessionAnswers(input);
}

export async function submitJlptMockSession(input: {
 sessionId: string;
 answers: Record<string, number | null>;
}) {
 return serviceSubmitJlptMockSession(input);
}

export async function getCompletedJlptMockSessionExam(sessionId: string) {
 return serviceGetCompletedJlptMockSessionExam(sessionId);
}
