export type PronunciationResult = { status: "unavailable" | "pass" | "needs_work"; message: string; provider: "none" | "validated-acoustic" };
const EV_FALSE_POSITIVES = new Set(["ey", "at", "et", "el", "e", "evet"]);
export function unsafeTranscriptWouldPass(target: string, transcript: string): boolean { const expected = target.toLocaleLowerCase("tr-TR").trim(); const heard = transcript.toLocaleLowerCase("tr-TR").trim(); if (expected === "ev" && EV_FALSE_POSITIVES.has(heard)) return false; return expected === heard; }
export function assessPronunciation(): PronunciationResult { return { status: "unavailable", provider: "none", message: "A validated Turkish acoustic pronunciation assessor is not configured." }; }
