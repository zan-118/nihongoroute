/**
 * @file cloud-sync-payload.ts
 * @description Pure helpers for converting local offline progress into Supabase RPC payloads.
 */

import { SRSState } from "@/lib/srs";
import { LessonProgress } from "@/store/types";

/** SRS item status. */
type SrsStatus = "learning" | "reviewing" | "graduated";

/** Database payload for SRS record update. */
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

/** Database payload for lesson progress update. */
export interface LessonSyncUpdate {
 lesson_id: string;
 is_completed: boolean;
 completed_at: string;
 updated_at: string;
 is_deleted: boolean;
}

/**
 * Convert millisecond timestamp to ISO string. Use fallback if invalid.
 * @param value Millisecond timestamp.
 * @param fallbackIso Fallback ISO string.
 */
function toIsoDate(value: number, fallbackIso: string) {
 // Check if timestamp is valid number.
 if (!Number.isFinite(value)) return fallbackIso;

 const date = new Date(value);
 // Check if date object is valid.
 return Number.isNaN(date.getTime()) ? fallbackIso : date.toISOString();
}

/**
 * Calculate SRS status based on interval days.
 * @param state Local SRS state.
 */
export function getSrsStatus(state: SRSState): SrsStatus {
 if (state.interval > 21) return "graduated";
 if (state.interval > 1) return "reviewing";
 return "learning";
}

/**
 * Build SRS update payloads for dirty records.
 * @param progressSrs Local SRS states map.
 * @param dirtySrs Set of modified SRS IDs.
 * @param now Current time reference.
 */
export function buildSrsUpdates(
 progressSrs: Record<string, SRSState>,
 dirtySrs: Iterable<string>,
 now = new Date()
): SrsSyncUpdate[] {
 const fallbackIso = now.toISOString();

 return Array.from(dirtySrs).map((id) => {
 const state = progressSrs[id];

 // Handle deleted or missing local state.
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

 // Map active local state to database schema.
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

/**
 * Build lesson update payloads for dirty records.
 * @param completedLessons Local lesson progress map.
 * @param dirtyLessons Set of modified lesson IDs.
 * @param now Current time reference.
 */
export function buildLessonUpdates(
 completedLessons: Record<string, LessonProgress>,
 dirtyLessons: Iterable<string>,
 now = new Date()
): LessonSyncUpdate[] {
 const fallbackIso = now.toISOString();

 return Array.from(dirtyLessons).map((id) => {
 const state = completedLessons[id];

 // Handle deleted or missing local lesson.
 if (!state) {
 return {
 lesson_id: id,
 is_completed: false,
 completed_at: fallbackIso,
 updated_at: fallbackIso,
 is_deleted: true,
 };
 }

 // Map active local lesson to database schema.
 return {
 lesson_id: id,
 is_completed: !state.isDeleted,
 completed_at: toIsoDate(state.completedAt, fallbackIso),
 updated_at: toIsoDate(state.updatedAt, fallbackIso),
 is_deleted: !!state.isDeleted,
 };
 });
}