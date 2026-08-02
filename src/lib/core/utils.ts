/**
 * @file utils.ts
 * @description Core global utility functions (local date formatting, array shuffling, Tailwind class merging, Japanese text slugification).
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// ==========================================
// Global Utility Functions
// ==========================================

/**
 * Merge Tailwind classes. Resolve conflicts.
 * 
 * @param inputs - Class values to merge.
 * @returns Merged class string.
 */
export function cn(...inputs: ClassValue[]) {
 // Combine inputs with clsx, then resolve Tailwind conflicts.
 return twMerge(clsx(inputs))
}

/**
 * Get local date string in YYYY-MM-DD format.
 * 
 * @returns Date string.
 */
export function getLocalDateString(): string {
 const now = new Date();
 // Get timezone offset in milliseconds.
 const offset = now.getTimezoneOffset() * 60000;
 // Shift date by offset, extract date part.
 const localISOTime = (new Date(now.getTime() - offset)).toISOString().split('T')[0];
 return localISOTime;
}

/**
 * Alias for getLocalDateString.
 */
export const getTodayDateString = getLocalDateString;

/**
 * Format seconds to MM:SS.
 * 
 * @param seconds - Total seconds.
 * @returns Formatted time string.
 */
export const formatTime = (seconds: number): string => {
 const m = Math.floor(seconds / 60);
 const s = seconds % 60;
 // Pad minutes and seconds with leading zeros.
 return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * Shuffle array using Fisher-Yates algorithm.
 * 
 * @param array - Target array.
 * @returns Shuffled copy of array.
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
 // Copy array to avoid mutation.
 const newArr = [...array];
 // Swap elements backwards.
 for (let i = newArr.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
 }
 return newArr;
};

/**
 * Convert string to URL slug. Keep Japanese characters.
 * 
 * @param text - Input string.
 * @returns Slugified string.
 */
export function slugify(text: string): string {
 return text
 .toString()
 .toLowerCase()
 .trim()
 .replace(/\s+/g, '-') // Replace spaces with hyphens.
 .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]+/g, '') // Keep alphanumeric and Japanese characters.
 .replace(/--+/g, '-'); // Remove double hyphens.
}

/**
 * Decode URL string recursively.
 * 
 * @param str - Encoded URL string.
 * @returns Decoded string.
 */
export function fullyDecode(str: string): string {
 if (!str) return "";
 let current = str;
 try {
 // Decode until string stops changing.
 while (true) {
 const decoded = decodeURIComponent(current);
 if (decoded === current) break;
 current = decoded;
 }
 } catch {
 // Prevent crash on bad URI percent encoding.
 }
 return current;
}