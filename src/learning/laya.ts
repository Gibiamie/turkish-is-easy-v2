import type { Lesson, Localized } from "../types";

export type LayaPhase = "before" | "wrong" | "correct";
export type LayaGuidance = { revealsAnswer: boolean; label?: Localized; message?: Localized; details?: Lesson["learnWhy"] };

const LABELS = {
  before: { en: "Practise with Laya", id: "Berlatih dengan Laya" },
  wrong: { en: "Laya’s next coaching step", id: "Langkah koaching Laya berikutnya" },
  correct: { en: "Why this worked", id: "Mengapa ini berhasil" },
} satisfies Record<LayaPhase, Localized>;

const answerPattern = (answer: string) => new RegExp(`(^|[^\\p{L}])${answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");

function isAnswerSafe(lesson: Lesson, text: Localized) {
  return [lesson.finalWord, ...lesson.answerParts]
    .filter((answer) => answer.length > 2)
    .every((answer) => !answerPattern(answer).test(text.en) && !answerPattern(answer).test(text.id));
}

function safeCoachingDetail(lesson: Lesson, preferred: Localized, fallback: Localized): Localized {
  return isAnswerSafe(lesson, preferred) ? preferred : isAnswerSafe(lesson, fallback) ? fallback : {
    en: "Keep the same rhythm as the Turkish model; do not add an extra English-style sound.",
    id: "Pertahankan ritme yang sama dengan contoh bahasa Turki; jangan tambahkan bunyi seperti bahasa Inggris.",
  };
}

function orderedPractice(lesson: Lesson): Localized {
  if (lesson.kind === "builder") {
    const focus = safeCoachingDetail(lesson, lesson.learnWhy.keyIdea, lesson.hint[0] ?? lesson.learnWhy.commonMistake);
    return {
      en: `Build it in three moves:\n1. Say the meaning out loud.\n2. Find the first Turkish block you would say.\n3. Add one block at a time and read the whole phrase after each choice.\n\nFocus: ${focus.en}`,
      id: `Susun dalam tiga langkah:\n1. Ucapkan artinya dengan suara keras.\n2. Temukan blok bahasa Turki pertama yang akan diucapkan.\n3. Tambahkan satu blok setiap kali dan baca seluruh frasa setelah setiap pilihan.\n\nFokus: ${focus.id}`,
    };
  }
  const focus = safeCoachingDetail(lesson, lesson.learnWhy.hear, lesson.hint[0] ?? lesson.learnWhy.keyIdea);
  return {
    en: `Practise before you choose:\n1. Play the Turkish recording once.\n2. Say the sound twice: normal, then slowly.\n3. Notice this: ${focus.en}\n4. Then choose the option that matches what you practised.`,
    id: `Berlatih sebelum memilih:\n1. Putar rekaman bahasa Turki satu kali.\n2. Ucapkan bunyinya dua kali: normal, lalu perlahan.\n3. Perhatikan ini: ${focus.id}\n4. Lalu pilih opsi yang cocok dengan latihanmu.`,
  };
}

function wrongAttemptCoaching(lesson: Lesson, hintIndex: number): Localized {
  const hint = safeCoachingDetail(lesson, lesson.hint[Math.min(Math.max(hintIndex, 0), lesson.hint.length - 1)] ?? lesson.learnWhy.commonMistake, lesson.learnWhy.keyIdea);
  const correction = safeCoachingDetail(lesson, lesson.learnWhy.commonMistake, lesson.learnWhy.keyIdea);
  return {
    en: `Change one thing, not everything. ${hint.en}\n\nSay the target slowly once more, then use this correction: ${correction.en}`,
    id: `Ubah satu hal, bukan semuanya. ${hint.id}\n\nUcapkan target perlahan sekali lagi, lalu gunakan perbaikan ini: ${correction.id}`,
  };
}

export function layaGuidance(lesson: Lesson, phase: LayaPhase, hintIndex = 0): LayaGuidance {
  if (phase === "correct") return { revealsAnswer: true, label: LABELS.correct, details: lesson.learnWhy };
  return { revealsAnswer: false, label: LABELS[phase], message: phase === "wrong" ? wrongAttemptCoaching(lesson, hintIndex) : orderedPractice(lesson) };
}
