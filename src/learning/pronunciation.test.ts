import { describe, expect, it } from "vitest";
import { assessPronunciation, unsafeTranscriptWouldPass } from "./pronunciation";
describe("permanent ev pronunciation regression", () => { it("keeps the exact safe transcript gate", () => expect(unsafeTranscriptWouldPass("ev", "ev")).toBe(true)); it.each(["ey", "at", "et", "el", "e", "evet"])("never accepts %s as ev", (wrong) => expect(unsafeTranscriptWouldPass("ev", wrong)).toBe(false)); it("does not use transcript matching as a score", () => expect(assessPronunciation().status).toBe("unavailable")); });
