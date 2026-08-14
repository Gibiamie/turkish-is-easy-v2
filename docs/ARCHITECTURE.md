# V2 Architecture

V2 is a typed React/Vite PWA. Validated curriculum data, strict EN/ID copy, local progress, a 1/3/7/14 SRS engine, and the pronunciation boundary are separate modules. Progress is namespaced by profile, locale, and learner mode; legacy local records are read and migrated when available.

No `/_studio` route is included in the static preview. The source constitution requires backend authentication and role authorization for studio access, so a client-only gate would be misleading.

| Module | Responsibility | Safety property |
|---|---|---|
| `content/curriculum.ts` | Starter curriculum and explanations | Correct blocks and mandatory EN/ID content. |
| `i18n.ts` | UI copy | No English fallback. |
| `learning/progress.ts` | Local persistence and learning actions | Real activity only. |
| `learning/srs.ts` | Review dates | Deterministic calendar intervals. |
| `learning/pronunciation.ts` | Future provider boundary | No transcript-only success result. |
| `App.tsx` | Learner experience | No unavailable learner feature. |
