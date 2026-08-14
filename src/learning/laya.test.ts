import { describe, expect, it } from "vitest";
import { ALL_LESSONS } from "../content/curriculum";
import { layaGuidance } from "./laya";

const wordPattern = (value: string) => new RegExp(`(^|[^\\p{L}])${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");

describe("Laya answer-leak guard", () => {
  it.each(["before", "wrong"] as const)("gives a lesson-safe, actionable clue before success (%s)", (phase) => {
    for (const lesson of ALL_LESSONS) {
      const guide = layaGuidance(lesson, phase, 0);
      expect(guide.revealsAnswer).toBe(false);
      expect(guide.details).toBeUndefined();
      expect(guide.label?.en).toBeTruthy();
      expect(guide.message?.en).toBeTruthy();
      for (const answer of [lesson.finalWord, ...lesson.answerParts].filter((value) => value.length > 2)) {
        expect(guide.message?.en).not.toMatch(wordPattern(answer));
      }
    }
  });

  it("changes the pre-answer clue after an incorrect attempt", () => {
    const lesson = ALL_LESSONS.find((item) => item.id === "alpha_a")!;
    expect(layaGuidance(lesson, "before").message).not.toEqual(layaGuidance(lesson, "wrong").message);
  });

  it("unlocks the sourced explanation only after a correct answer", () => {
    const guide = layaGuidance(ALL_LESSONS[0], "correct");
    expect(guide.revealsAnswer).toBe(true);
    expect(guide.details?.keyIdea.en).toBeTruthy();
  });
});
