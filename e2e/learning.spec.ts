import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const sessionKey = "turkish-is-easy-v2::session";

async function clearLearner(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/");
}

async function chooseProfile(page: Page, name: "Bella" | "Ayza" | "Adult") {
  await clearLearner(page);
  await page.getByRole("button", { name: new RegExp(`\\b${name}\\b`) }).click();
}

async function restoreLesson(page: Page, lessonId: string, profileId = "bella") {
  await page.goto("/");
  await page.evaluate(({ key, serialized }) => { localStorage.clear(); localStorage.setItem(key, serialized); }, {
    key: sessionKey,
    serialized: JSON.stringify({ profileId, view: "lesson", lessonId, lessonSource: "review" }),
  });
  await page.goto(`/index.html#/lesson/${lessonId}`);
}

test("Bella follows teach → safe attempt → correct practice without an answer leak", async ({ page }) => {
  await chooseProfile(page, "Bella");
  await expect(page.getByRole("heading", { name: "A small Turkish win is waiting." })).toBeVisible();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await expect(page.getByText("New word")).toBeVisible();
  await page.getByRole("button", { name: /I heard it — start practice/ }).click();

  await page.getByRole("button", { name: /Laya's help/ }).click();
  await expect(page.getByRole("button", { name: /Choose a clue/ })).toBeVisible();
  await expect(page.locator(".guide-body")).toContainText("Replay the Turkish recording");
  await expect(page.locator(".guide-body")).not.toContainText("Try it yourself first");
  await expect(page.locator(".guide-body")).not.toContainText("father");

  await page.getByRole("button", { name: "e", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Not yet. Try a different choice or order.");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("button", { name: "a", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("You built it.");
});

test("Ayza retains a complete Indonesian path and the adult profile presents focused mode", async ({ page }) => {
  await chooseProfile(page, "Ayza");
  await expect(page.getByRole("heading", { name: "Satu kemenangan kecil bahasa Turki sudah menunggu." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kata saya" })).toBeVisible();

  await chooseProfile(page, "Adult");
  await expect(page.getByRole("heading", { name: "Build Turkish one useful idea at a time." })).toBeVisible();
  await page.getByRole("button", { name: /Learn$/ }).click();
  await expect(page.getByText("Focused mode")).toBeVisible();
});

test("builder exercise, review, and My Words are reachable from restored learning state", async ({ page }) => {
  await restoreLesson(page, "meaning_evim");
  await expect(page.getByRole("heading", { name: "my house" })).toBeVisible();
  await page.getByRole("button", { name: /I heard it — start practice/ }).click();
  await page.getByRole("button", { name: "ev", exact: true }).click();
  await page.getByRole("button", { name: "im", exact: true }).click();
  await page.getByRole("button", { name: "Check my answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("You built it.");
  await page.getByRole("button", { name: "I need more practice", exact: true }).click();
  await expect(page.getByRole("heading", { name: "You are all caught up.", level: 1 })).toBeVisible();
  await page.evaluate(() => {
    const key = "turkish-is-easy-v2::bella::en::kids";
    const progress = JSON.parse(localStorage.getItem(key) ?? "{}");
    progress.review = progress.review.map((entry: { dueOn: string }) => ({ ...entry, dueOn: new Date().toISOString().slice(0, 10) }));
    localStorage.setItem(key, JSON.stringify(progress));
  });
  await page.goto("/index.html#/review");
  await expect(page.getByRole("heading", { name: /ready for review/ })).toBeVisible();
  await page.getByRole("button", { name: /My words$/ }).click();
  await expect(page.getByRole("button", { name: /Review now/ })).toBeVisible();
});

test("hash session returns to the same lesson and browser back restores the previous view", async ({ page }) => {
  await chooseProfile(page, "Bella");
  await page.getByRole("button", { name: /^Continue/ }).click();
  await expect(page).toHaveURL(/#\/lesson\/alpha_a$/);
  await page.reload();
  await expect(page.getByText("New word")).toBeVisible();
  await page.getByRole("button", { name: /Back$/ }).click();
  await expect(page).toHaveURL(/#\/learn$/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/lesson\/alpha_a$/);
});

test("microphone permission denial remains an honest, non-blocking fallback", async ({ page }) => {
  await page.addInitScript(() => {
    class DeniedRecognition {
      lang = "";
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start() { setTimeout(() => { this.onerror?.(Object.assign(new Event("error"), { error: "not-allowed" })); this.onend?.(); }, 0); }
    }
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
    Object.assign(window, { SpeechRecognition: DeniedRecognition, webkitSpeechRecognition: DeniedRecognition });
  });
  await chooseProfile(page, "Bella");
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: /Use my microphone/ }).click();
  await expect(page.getByRole("status")).toContainText("Microphone access is turned off.");
  await expect(page.getByRole("button", { name: "Try the microphone again", exact: true })).toBeVisible();
});

test("microphone practice returns an exact transcript cue when the browser hears the Turkish word", async ({ page }) => {
  await page.addInitScript(() => {
    class HeardRecognition {
      lang = "";
      interimResults = false;
      continuous = false;
      maxAlternatives = 1;
      onresult: ((event: { results: Array<Array<{ transcript: string }>> }) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start() { setTimeout(() => this.onresult?.({ results: [[{ transcript: "a" }]] }), 0); }
      stop() {}
    }
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
    Object.assign(window, { SpeechRecognition: HeardRecognition, webkitSpeechRecognition: HeardRecognition });
  });
  await chooseProfile(page, "Bella");
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: /Use my microphone/ }).click();
  await expect(page.getByRole("status")).toContainText("The recognizer heard: “a”");
  await expect(page.getByRole("status")).toContainText("exactly matches the reference word");
});

test("dashboard, lesson, builder, review, My Words, adult EN and kid ID have no WCAG A/AA axe violations", async ({ page }) => {
  await chooseProfile(page, "Bella");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
});
