import { describe, expect, it } from "vitest";
import { ALL_LESSONS, TOPICS } from "./curriculum";

describe("approved curriculum invariants", () => {
  it("contains no isolated soft-g lesson", () => expect(ALL_LESSONS.some((lesson) => lesson.finalWord === "ğ")).toBe(false));
  it("keeps the verified book-building form", () => {
    const kitabimda = ALL_LESSONS.find((lesson) => lesson.id === "meaning_kitabimda");
    expect(kitabimda?.answerParts).toEqual(["kitab", "ım", "da"]);
    expect(kitabimda?.finalWord).toBe("kitabımda");
  });
  it("keeps every builder answer inside its visible blocks and every topic meaningful", () => {
    expect(TOPICS.every((topic) => topic.lessons.length > 0)).toBe(true);
    expect(ALL_LESSONS.filter((lesson) => lesson.kind === "builder").every((lesson) => lesson.answerParts.every((part) => lesson.options.includes(part)))).toBe(true);
  });
});
