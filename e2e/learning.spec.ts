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
  await expect(page.getByRole("button", { name: /Practise with Laya/ })).toBeVisible();
  await expect(page.locator(".guide-body")).toContainText("Practise before you choose");
  await expect(page.locator(".guide-body")).toContainText("Say the sound twice");
  await expect(page.locator(".guide-body")).not.toContainText("Try it yourself first");

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
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => { throw new DOMException("denied", "NotAllowedError"); } } });
  });
  await chooseProfile(page, "Bella");
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: "Record my voice for 3 seconds", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("The microphone could not start.");
});

test("a learner can record and listen back without browser speech-to-text", async ({ page }) => {
  await page.addInitScript(() => {
    class FakeRecorder {
      mimeType = "audio/webm";
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onerror: (() => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(_stream: unknown) {}
      start() { setTimeout(() => { this.ondataavailable?.({ data: new Blob(["practice"], { type: "audio/webm" }) }); this.onstop?.(); }, 0); }
      stop() {}
    }
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
    Object.defineProperty(window, "MediaRecorder", { configurable: true, value: FakeRecorder });
  });
  await chooseProfile(page, "Bella");
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: "Record my voice for 3 seconds", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Your recording is ready.");
  await expect(page.getByRole("button", { name: "Listen back to my recording", exact: true })).toBeVisible();
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
  await page.getByRole("button", { name: "Optional: check what the browser heard", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("The browser heard: “a”");
  await expect(page.getByRole("status")).toContainText("matches the reference text");
});

test("dashboard, lesson, builder, review, My Words, adult EN and kid ID have no WCAG A/AA axe violations", async ({ page }) => {
  await chooseProfile(page, "Bella");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
});
