import { describe, expect, it } from "vitest";

import { ALL_LESSONS } from "../content/curriculum";
import { layaGuidance } from "./laya";

describe("Laya answer-leak guard", () => {
  it.each(["before", "wrong"] as const)("does not reveal any V1 answer before success (%s)", (phase) => {
    const safeBaseline = layaGuidance(ALL_LESSONS[0], phase);
    for (const lesson of ALL_LESSONS) {
      const guide = layaGuidance(lesson, phase);
      expect(guide.revealsAnswer).toBe(false);
      expect(guide.details).toBeUndefined();
      expect(guide).toEqual(safeBaseline);
    }
  });

  it("unlocks the sourced explanation only after a correct answer", () => {
    const guide = layaGuidance(ALL_LESSONS[0], "correct");
    expect(guide.revealsAnswer).toBe(true);
    expect(guide.details?.keyIdea.en).toBeTruthy();
  });
});
