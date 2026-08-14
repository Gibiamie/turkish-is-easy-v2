# Turkish Is Easy V2 — Release Readiness

**Release candidate:** `1980bc2` on `main`  
**Repository:** <https://github.com/Gibiamie/turkish-is-easy-v2>  
**Live site:** <https://gibiamie.github.io/turkish-is-easy-v2/>  
**Cloud quality run:** <https://github.com/Gibiamie/turkish-is-easy-v2/actions/runs/31775244141>  
**Pages deployment:** <https://github.com/Gibiamie/turkish-is-easy-v2/actions/runs/31774913037>

## Release conclusion

The V2 recovery satisfies the recorded V1 parity baseline and the implemented production quality gates. The public learning experience is live, while learner progress remains intentionally local to the browser and device. The project does **not** claim acoustic pronunciation scoring: browser speech recognition is presented only as a transcript cue and never as a pronunciation grade.

## V1 → V2 parity

| Capability | V1 baseline | V2 | Result |
| --- | ---: | ---: | --- |
| Topics | 15 | 15 | PASS |
| Published non-review learning items | 133 | 145 | PASS |
| Audio MP3 assets | 184 | 184 | PASS |
| Referenced V1 audio mappings | 121 | 184 available assets | PASS |
| Owner-verified audio mappings | 23 | 23 | PASS |
| Learner profiles | 4 | 4 | PASS |

The strict gate uses a version-controlled V1 baseline generated from the read-only source repository. This permits reproducible CI checks without copying or modifying the original application.

## Adversarial pre-release review

| Review area | Verification performed | Result |
| --- | --- | --- |
| Curriculum and Turkish orthography | 15 migrated topics and 145 lessons are checked for locale content, block integrity, asset paths, and an isolated `ğ` lesson. | PASS |
| Teach-before-test pedagogy | Every lesson begins with a teach state; recognition items expose word, meaning, and audio before practice. | PASS |
| Laya answer safety | Before and after an incorrect attempt, Laya returns a fixed, lesson-independent clue. Explanations unlock only after success. | PASS |
| Pronunciation false positives | Exact transcript matching is tested, including permanent `ev` rejections for `ey`, `at`, `et`, `el`, `e`, and `evet`. | PASS |
| Assessment honesty | The interface labels speech recognition as a transcript cue, not an acoustic pronunciation score, and retains a clear unavailable boundary. | PASS |
| SRS | Review scheduling uses real calendar days at 1/3/7/14 days and removes a completed item after graduation. | PASS |
| Localization | EN and Indonesian key sets have strict parity. Browser E2E confirms Bella EN and Ayza Indonesian paths. | PASS |
| Profiles and continuity | Four separate local profiles are supported. Hash routes and local session state restore the active lesson after refresh and support browser Back. | PASS |
| My Words and rewards | Completed vocabulary, topic badges, daily progress, streak milestones, and review entry points are persisted locally. | PASS |
| Offline/PWA | Versioned service-worker caching and deployment under the GitHub Pages base path are included. | PASS |
| Accessibility | Keyboard-native buttons, focus styling, live feedback regions, and a WCAG A/AA axe audit are part of E2E. The detected navigation and version-label contrast issues were remediated. | PASS |
| Visual regression | Five responsive baselines cover 360, 390, 768, 1280, and 1440 pixel viewports across kids/adults and EN/ID content. A 0.2% pixel threshold permits renderer anti-aliasing differences while preserving layout regression detection. | PASS |
| Security and privacy | No credentials or voice recordings are persisted by V2. Progress is local-only. | PASS |

## Executed quality gates

| Gate | Latest result |
| --- | --- |
| Production TypeScript/Vite build | PASS |
| Content QA | PASS for 145 lessons |
| Strict V1 parity | PASS |
| Audio migration report | 184/184 migrated; 23/23 owner-verified preserved |
| Vitest | 33 passing tests across 8 files |
| Playwright | 7 passing scenarios: profiles/locales, teach/practice, builder, review, My Words, session restore, microphone denial, axe, and visual baselines |
| GitHub CI | PASS, including Chromium installation and full E2E suite |
| GitHub Pages | PASS and live |

## Product limitations and owner decisions

The current application deliberately does not award or display a pronunciation score. A browser transcript match does not demonstrate acoustic accuracy. A future scoring integration must pass the documented acceptance gate for Turkish locale support and must not reintroduce substring matching or label a transcript as pronunciation assessment. The current research record is in [`ACOUSTIC-ASSESSMENT-RESEARCH.md`](./ACOUSTIC-ASSESSMENT-RESEARCH.md); Microsoft’s official pronunciation-assessment locale documentation is the controlling provider reference.[1]

Progress is stored on each browser/device. Cross-device synchronization, account-based recovery, paid pronunciation services, and any new owner-recorded audio require an explicit product or owner decision before implementation.

## References

[1]: https://learn.microsoft.com/azure/ai-services/speech-service/how-to-pronunciation-assessment "Azure Speech Pronunciation Assessment documentation"
