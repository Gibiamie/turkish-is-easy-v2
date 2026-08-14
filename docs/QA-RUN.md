# V2 Quality Run

## Preview observations

The independent V2 preview was built successfully and loaded through the local Vite server. The profile selection screen presents four intentional paths rather than placeholder cards. The Bella dashboard rendered the visual hero card, owner-supplied lesson imagery for `ev`, `kitap`, and `araba`, progress ring, primary action, and fixed navigation without an overlap in the inspected desktop viewport.

The first Bella recognition lesson was opened with no final answer revealed. Selecting the deliberately wrong `su` option kept `ev` hidden, displayed the progressive picture-based hint, and provided a clear retry control. The learner-facing pronunciation region stayed in the conservative `Could not assess` state and did not expose browser transcription as a score.

After the correct `ev` solution, the separate **Practice done**, **I already know this**, and **I need more practice** actions appeared. The `ev` card reported that no owner-approved recording is available rather than pretending that a generic or synthetic audio file is verified.

The current V2 starter scope exposes nine validated learning items across three visible paths. The user-facing pronunciation region does not expose a microphone control or a false success claim; it clearly describes the unavailable validated assessment state.

## Automated gates

| Gate | Result |
|---|---|
| TypeScript and production build | Passed. |
| Curriculum and declared asset check | Passed for 9 learning items. |
| SRS, action, curriculum, localization, and pronunciation unit tests | Passed: 17 tests. |
| Permanent `ev` negative fixtures | Passed: `ey`, `at`, `et`, `el`, `e`, and `evet` do not pass. |

## Remaining release constraints

The V2 preview does not include account sync, a content studio, cloud audio processing, or a provider-backed Turkish pronunciation score. These capabilities remain intentionally absent rather than represented as incomplete learner controls.
