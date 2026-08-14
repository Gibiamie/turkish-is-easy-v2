import { describe, expect, it } from "vitest";

import { ALL_LESSONS, TOPICS } from "./curriculum";

describe("V1-recovered curriculum invariants", () => {
  it("preserves the complete V1 topic baseline and at least 133 learning items", () => {
    expect(TOPICS).toHaveLength(15);
    expect(ALL_LESSONS.length).toBeGreaterThanOrEqual(133);
  });

  it("keeps the V1 Mixed Review topic and its published practice items visible", () => {
    const review = TOPICS.find((topic) => topic.id === "review");
    expect(review?.lessons.length).toBeGreaterThan(0);
    expect(TOPICS.every((topic) => topic.lessons.length > 0)).toBe(true);
  });

  it("contains no isolated soft-g lesson and uses a real-word example instead", () => {
    const softG = ALL_LESSONS.find((lesson) => lesson.id === "alpha_soft_g");
    expect(ALL_LESSONS.some((lesson) => lesson.finalWord === "ğ")).toBe(false);
    expect(softG?.finalWord).toBe("dağ");
  });

  it("keeps the verified book-building form", () => {
    const kitabimda = ALL_LESSONS.find((lesson) => lesson.id === "meaning_kitabimda");
    expect(kitabimda?.answerParts).toEqual(["kitab", "ım", "da"]);
    expect(kitabimda?.finalWord).toBe("kitabımda");
  });

  it("keeps every builder answer inside its visible blocks", () => {
    expect(ALL_LESSONS.filter((lesson) => lesson.kind === "builder").every((lesson) => lesson.answerParts.every((part) => lesson.options.includes(part)))).toBe(true);
  });

  it("migrates the source Laya explanation for a core sound contrast", () => {
    const alphaE = ALL_LESSONS.find((lesson) => lesson.id === "alpha_e");
    expect(alphaE?.learnWhy.keyIdea.en).toContain("Turkish e");
    expect(alphaE?.learnWhy.commonMistake.en).toContain("ev");
  });
});
