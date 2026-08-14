import type { ReviewEntry } from "../types";
export const SRS_INTERVALS = [1, 3, 7, 14] as const;
export function isoDate(date = new Date()): string { return date.toISOString().slice(0, 10); }
export function addDays(iso: string, days: number): string { const date = new Date(`${iso}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
export function scheduleReview(lessonId: string, existing: ReviewEntry | undefined, today = isoDate(), reason: ReviewEntry["reason"] = "scheduled"): ReviewEntry { const step = Math.min((existing?.step ?? -1) + 1, SRS_INTERVALS.length - 1); return { lessonId, step, dueOn: addDays(today, SRS_INTERVALS[step]), updatedAt: today, reason }; }
export function needsReview(entry: ReviewEntry, today = isoDate()): boolean { return entry.dueOn <= today; }
export function realDayStreak(activityDates: string[], today = isoDate()): number { const dates = new Set(activityDates); let count = 0; let cursor = today; while (dates.has(cursor)) { count += 1; cursor = addDays(cursor, -1); } return count; }
