/**
 * @file cloud-sync-payload.ts
 * @description Pure helpers for converting local offline progress into Supabase RPC payloads.
 */

import { SRSState } from "@/lib/srs";
import { LessonProgress } from "@/store/types";

type SrsStatus = "learning" | "reviewing" | "graduated";

export interface SrsSyncUpdate {
  word_id: string;
  repetition: number;
  interval: number;
  ease_factor: number;
  next_review: string;
  updated_at: string;
  status: SrsStatus;
  is_deleted: boolean;
  custom_mnemonic: string | null;
}

export interface LessonSyncUpdate {
  lesson_id: string;
  is_completed: boolean;
  completed_at: string;
  updated_at: string;
  is_deleted: boolean;
}

function toIsoDate(value: number, fallbackIso: string) {
  if (!Number.isFinite(value)) return fallbackIso;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallbackIso : date.toISOString();
}

export function getSrsStatus(state: SRSState): SrsStatus {
  if (state.interval > 21) return "graduated";
  if (state.interval > 1) return "reviewing";
  return "learning";
}

export function buildSrsUpdates(
  progressSrs: Record<string, SRSState>,
  dirtySrs: Iterable<string>,
  now = new Date()
): SrsSyncUpdate[] {
  const fallbackIso = now.toISOString();

  return Array.from(dirtySrs).map((id) => {
    const state = progressSrs[id];

    if (!state) {
      return {
        word_id: id,
        repetition: 0,
        interval: 1,
        ease_factor: 2.5,
        next_review: fallbackIso,
        updated_at: fallbackIso,
        status: "learning",
        is_deleted: true,
        custom_mnemonic: null,
      };
    }

    return {
      word_id: id,
      repetition: state.repetition,
      interval: state.interval,
      ease_factor: state.easeFactor,
      next_review: toIsoDate(state.nextReview, fallbackIso),
      updated_at: toIsoDate(state.updatedAt, fallbackIso),
      status: getSrsStatus(state),
      is_deleted: !!state.isDeleted,
      custom_mnemonic: state.customMnemonic || null,
    };
  });
}

export function buildLessonUpdates(
  completedLessons: Record<string, LessonProgress>,
  dirtyLessons: Iterable<string>,
  now = new Date()
): LessonSyncUpdate[] {
  const fallbackIso = now.toISOString();

  return Array.from(dirtyLessons).map((id) => {
    const state = completedLessons[id];

    if (!state) {
      return {
        lesson_id: id,
        is_completed: false,
        completed_at: fallbackIso,
        updated_at: fallbackIso,
        is_deleted: true,
      };
    }

    return {
      lesson_id: id,
      is_completed: !state.isDeleted,
      completed_at: toIsoDate(state.completedAt, fallbackIso),
      updated_at: toIsoDate(state.updatedAt, fallbackIso),
      is_deleted: !!state.isDeleted,
    };
  });
}
