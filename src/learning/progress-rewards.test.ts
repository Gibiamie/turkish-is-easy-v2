import { describe, expect, it } from "vitest";

import { applyAction, emptyProgress, resolveReview } from "./progress";

describe("V1-compatible local rewards", () => {
  it("counts a first completion once toward the daily goal", () => {
    const once = applyAction(emptyProgress(), "root_ev", "practice_done", "2026-08-14");
    const again = applyAction(once, "root_ev", "already_known", "2026-08-14");
    expect(again.dailyCounts["2026-08-14"]).toBe(1);
  });

  it("persists a real three-day streak milestone", () => {
    let progress = emptyProgress();
    progress = applyAction(progress, "a", "practice_done", "2026-08-12");
    progress = applyAction(progress, "b", "practice_done", "2026-08-13");
    progress = applyAction(progress, "c", "practice_done", "2026-08-14");
    expect(progress.streakMilestones).toContain(3);
  });

  it("advances a scheduled review through 1/3/7/14 days before graduation", () => {
    let progress = applyAction(emptyProgress(), "root_ev", "needs_practice", "2026-08-14");
    expect(progress.review[0].dueOn).toBe("2026-08-15");
    progress = resolveReview(progress, "root_ev", true, "2026-08-15");
    expect(progress.review[0].dueOn).toBe("2026-08-18");
    progress = resolveReview(progress, "root_ev", true, "2026-08-18");
    expect(progress.review[0].dueOn).toBe("2026-08-25");
    progress = resolveReview(progress, "root_ev", true, "2026-08-25");
    expect(progress.review[0].dueOn).toBe("2026-09-08");
    expect(resolveReview(progress, "root_ev", true, "2026-09-08").review).toEqual([]);
  });
});
