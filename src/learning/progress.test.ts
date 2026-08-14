import { describe, expect, it } from "vitest";
import { applyAction, emptyProgress } from "./progress";

describe("learning action integrity", () => {
  it("records a real practice action without manufacturing a review entry", () => {
    const result = applyAction(emptyProgress(), "root_ev", "practice_done", "2026-08-14");
    expect(result.completedLessonIds).toEqual(["root_ev"]);
    expect(result.actionLog.root_ev).toBe("practice_done");
    expect(result.review).toEqual([]);
    expect(result.activityDates).toEqual(["2026-08-14"]);
  });
  it("keeps an item in the review queue when a learner asks for more practice", () => {
    const first = applyAction(emptyProgress(), "plural_evler", "needs_practice", "2026-08-14");
    expect(first.review[0]).toMatchObject({ lessonId: "plural_evler", step: 0, dueOn: "2026-08-15", reason: "needs_practice" });
    const second = applyAction(first, "plural_evler", "needs_practice", "2026-08-15");
    expect(second.review).toHaveLength(1);
    expect(second.review[0]).toMatchObject({ step: 1, dueOn: "2026-08-18", reason: "needs_practice" });
  });
});
