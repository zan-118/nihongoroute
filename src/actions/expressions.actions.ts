"use server";

/**
 * @file expressions.actions.ts
 * @description Server Action for retrieving random Japanese daily expressions from Supabase.
 * @module actions
 */

// Import & Dependencies

import { getRandomExpressionData } from "@/lib/services/content-repository";
import { logger } from "@/lib/core/logger";

// TYPES

/**
 * Shape of random expression data.
 */
export interface RandomExpression {
 id: string;
 text: string;
 reading: string;
 meanings: string[];
 indonesia: string[];
 jlpt_level: string | null;
}

// SERVER ACTIONS

/**
 * Fetch single random common expression from database.
 * @returns Expression object or null if error/empty.
 */
export async function getRandomExpression(): Promise<RandomExpression | null> {
 try {
 const data = await getRandomExpressionData();

 if (!data) return null;

 // Map database response to RandomExpression type.
 return {
 id: data.id as string,
 text: data.text as string,
 reading: data.reading as string,
 meanings: Array.isArray(data.meanings) ? (data.meanings as string[]) : [],
 indonesia: Array.isArray(data.indonesia) ? (data.indonesia as string[]) : [],
 jlpt_level: (data.jlpt_level as string | null) ?? null,
 };
 } catch (error) {
 logger.error("[getRandomExpression] error:", error);
 return null;
 }
}
