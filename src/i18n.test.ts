import { describe, expect, it } from "vitest";
import { assertLocaleParity, t } from "./i18n";
describe("localization isolation", () => { it("keeps EN and ID keys in parity", () => expect(assertLocaleParity()).toBe(true)); it("uses requested Indonesian UI copy", () => expect(t("id", "continue")).toBe("Lanjutkan")); });
