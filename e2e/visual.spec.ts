import { expect, test, type Page } from "@playwright/test";

async function openWithSession(page: Page, profileId: "bella" | "ayza" | "adult", route: string, lessonId?: string) {
  await page.goto("/");
  await page.evaluate(({ key, serialized }) => { localStorage.clear(); localStorage.setItem(key, serialized); }, {
    key: "turkish-is-easy-v2::session",
    serialized: JSON.stringify({ profileId, view: route, lessonId, lessonSource: "new" }),
  });
  await page.goto(`/index.html#/${route}${lessonId ? `/${lessonId}` : ""}`);
}

test("visual baselines cover mobile, tablet, laptop and wide learning states", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await openWithSession(page, "bella", "home");
  await expect(page).toHaveScreenshot("bella-home-360.png", { fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await openWithSession(page, "bella", "lesson", "alpha_a");
  await expect(page).toHaveScreenshot("bella-lesson-390.png", { fullPage: true });

  await page.setViewportSize({ width: 768, height: 1024 });
  await openWithSession(page, "ayza", "home");
  await expect(page).toHaveScreenshot("ayza-home-768.png", { fullPage: true });

  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithSession(page, "adult", "learn");
  await expect(page).toHaveScreenshot("adult-learn-1280.png", { fullPage: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await openWithSession(page, "bella", "words");
  await expect(page).toHaveScreenshot("bella-words-1440.png", { fullPage: true });
});
