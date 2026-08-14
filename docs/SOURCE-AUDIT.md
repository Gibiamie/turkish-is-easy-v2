# Turkish Is Easy V2 — Source Audit

The existing [Turkish Is Easy repository](https://github.com/Gibiamie/turkish-is-easy) and live app were inspected as **read-only**. The audit covered curriculum data, runtime, localization, browser speech, SRS, local progress, audio registry, PWA configuration, governance, release gates, and learner-facing routes.

| Area | Preserve | Transform or add in V2 |
|---|---|---|
| Pedagogy | Meaning building, shuffled blocks, solve-before-reveal, full explanations, correct `kitab` / `köpeğ` forms, no isolated `ğ`. | Typed curriculum data with automated content assertions. |
| Paths | Bella EN, Ayza Bahasa Indonesia, adult pacing, real activity, separate learning actions. | Exact localization-parity validation; no silent English fallback. |
| Audio | Owner-approved-file principle and post-success builder audio. | Explicit verified-audio metadata; unavailable audio is hidden, not guessed. |
| Pronunciation | Practice intent. | Browser transcript matching is removed as a score. Turkish is absent from Microsoft’s current official 33-locale pronunciation-assessment list. |
| SRS | 1/3/7/14-day goal. | Deterministic calendar-day engine; legacy final-step deletion is removed. |
| PWA | Offline learner access. | Versioned V2 cache and update-safe application shell. |

## Critical findings

Legacy speech handling folds Turkish characters and accepts browser-recognition alternatives that contain the target. It can falsely pass incorrect speech, and therefore cannot assess pronunciation. V2 encodes the permanent `ev` negative fixtures: `ey`, `at`, `et`, `el`, `e`, and `evet` must never pass.

Legacy localization falls back to English when the requested key is absent. This can leak English UI into Ayza’s Indonesian path. V2 removes fallback behavior and fails its QA check when locale keys differ.

The source constitution remains binding: no wrong Turkish, no answer reveal before a genuine attempt, no unapproved audio, no fake progress, no dead learner control, and no frontend-only `/_studio` protection.
