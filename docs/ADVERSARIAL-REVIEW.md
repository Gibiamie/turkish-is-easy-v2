# V2 Adversarial Quality Review

The review treats convenient-looking behavior as untrusted until it is tied to an enforceable product rule.

| Adversarial case | V2 control | Evidence |
|---|---|---|
| Browser transcript says `evet` when target is `ev` | Transcript matching is not a learner score; the permanent fixture is negative. | `pronunciation.test.ts` includes `ey`, `at`, `et`, `el`, `e`, and `evet`. |
| A learner gets the wrong answer but wants the solution | The correct answer remains hidden; a levelled hint appears after a genuine attempt. | Local preview walkthrough and `QA-RUN.md`. |
| A nonexistent recording looks like a valid listening action | The learner sees an unavailable-audio statement instead of a play control. | `verifiedAudio` is optional and path-checked. |
| A child completes no exercise but receives progress | Completion actions appear only following a correct response. | `applyAction` is called only by success controls. |
| A learner asks for more practice | A single durable review entry is scheduled, then advances through 1/3/7/14 days. | `progress.test.ts` and `srs.test.ts`. |
| Indonesian path silently falls back to English | UI dictionaries require exact key parity and use no fallback resolver. | `i18n.test.ts`. |
| Cached legacy application files survive a V2 release | The service worker deletes prior named caches during activation. | `public/sw.js`. |
| Static site exposes a fake protected studio | No studio route is shipped; a static client-side gate is not security. | `ARCHITECTURE.md`. |

## Release decision

The static V2 preview is suitable for a controlled preview deployment. It is not a claim that provider-backed Turkish pronunciation assessment, authenticated studio management, or cloud profile synchronization exists. Those future capabilities must pass separate evidence and authorization gates before learner-facing release.
