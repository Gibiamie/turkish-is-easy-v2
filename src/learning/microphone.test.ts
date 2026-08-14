import { describe, expect, it } from "vitest";

import { transcriptPracticeResult } from "./microphone";

describe("guided microphone transcript practice", () => {
  it("returns a recognition cue for an exact reference transcript without creating a score", () => {
    expect(transcriptPracticeResult("ev", "ev")).toEqual({ transcript: "ev", exactReferenceMatch: true });
  });

  it.each(["ey", "at", "et", "el", "e", "evet"])("does not treat %s as ev", (heard) => {
    expect(transcriptPracticeResult("ev", heard).exactReferenceMatch).toBe(false);
  });
});
