import type { Profile, Topic } from "../types";
import { MIGRATED_V1_TOPICS } from "./v1-migrated";

export const PROFILES: Profile[] = [
  { id: "bella", name: "Bella", locale: "en", mode: "kids", badge: "B", description: { en: "English guidance · playful visual lessons", id: "Panduan bahasa Inggris · pelajaran visual" } },
  { id: "ayza", name: "Ayza", locale: "id", mode: "kids", badge: "A", description: { en: "Bahasa Indonesia guidance · pelajaran visual", id: "Panduan Bahasa Indonesia · pelajaran visual" } },
  { id: "adult", name: "Adult", locale: "en", mode: "adult", badge: "AD", description: { en: "English guidance · calm, focused practice", id: "Panduan bahasa Inggris · latihan tenang dan fokus" } },
  { id: "guest", name: "Guest", locale: "en", mode: "family", badge: "G", description: { en: "Try a family learning session", id: "Coba sesi belajar keluarga" } },
];

export const TOPICS: Topic[] = MIGRATED_V1_TOPICS;
export const ALL_LESSONS = TOPICS.flatMap((topic) => topic.lessons.map((lesson) => ({ ...lesson, topicId: topic.id })));
export const lessonById = (id: string) => ALL_LESSONS.find((lesson) => lesson.id === id);
