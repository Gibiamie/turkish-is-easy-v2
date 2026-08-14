import type { Lesson, Localized } from "../types";

export type LayaPhase = "before" | "wrong" | "correct";
export type LayaGuidance = { revealsAnswer: boolean; label?: Localized; message?: Localized; details?: Lesson["learnWhy"] };

const LABELS = {
  before: { en: "Need a clue?", id: "Butuh petunjuk?" },
  wrong: { en: "A clue for this attempt", id: "Petunjuk untuk percobaan ini" },
  correct: { en: "Why this worked", id: "Mengapa ini berhasil" },
} satisfies Record<LayaPhase, Localized>;

function preAttemptClue(lesson: Lesson): Localized {
  if (lesson.kind === "builder") return {
    en: "Read the meaning once more, then put the Turkish blocks in the order you would say them.",
    id: "Baca artinya sekali lagi, lalu susun blok bahasa Turki sesuai urutan pengucapannya.",
  };
  return {
    en: "Replay the Turkish recording. Choose the option whose sound matches the example you just learned.",
    id: "Putar ulang rekaman bahasa Turki. Pilih opsi yang bunyinya cocok dengan contoh yang baru kamu pelajari.",
  };
}

function wrongAttemptClue(lesson: Lesson, hintIndex: number): Localized {
  const source = lesson.hint[Math.min(Math.max(hintIndex, 0), lesson.hint.length - 1)] ?? preAttemptClue(lesson);
  return {
    en: `${source.en} Replay the recording, then change one choice or its order.`,
    id: `${source.id} Putar ulang rekamannya, lalu ubah satu pilihan atau urutannya.`,
  };
}

export function layaGuidance(lesson: Lesson, phase: LayaPhase, hintIndex = 0): LayaGuidance {
  if (phase === "correct") return { revealsAnswer: true, label: LABELS.correct, details: lesson.learnWhy };
  return { revealsAnswer: false, label: LABELS[phase], message: phase === "wrong" ? wrongAttemptClue(lesson, hintIndex) : preAttemptClue(lesson) };
}
