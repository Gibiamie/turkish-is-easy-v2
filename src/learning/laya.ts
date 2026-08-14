import type { Lesson, Localized } from "../types";

export type LayaPhase = "before" | "wrong" | "correct";
export type LayaGuidance = { revealsAnswer: boolean; message?: Localized; details?: Lesson["learnWhy"] };

const BEFORE: Localized = { en: "Try it yourself first. Laya can give a clue without giving away the answer.", id: "Coba sendiri dulu. Laya dapat memberi petunjuk tanpa membocorkan jawabannya." };
const WRONG: Localized = { en: "Use the picture and the Turkish recording as clues. Try a different choice or order.", id: "Gunakan gambar dan rekaman bahasa Turki sebagai petunjuk. Coba pilihan atau urutan lain." };

export function layaGuidance(lesson: Lesson, phase: LayaPhase): LayaGuidance {
  if (phase === "correct") return { revealsAnswer: true, details: lesson.learnWhy };
  return { revealsAnswer: false, message: phase === "wrong" ? WRONG : BEFORE };
}
