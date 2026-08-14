# Turkish Is Easy V2

Turkish Is Easy V2 is an independent, typed progressive web application that turns the validated learning rules from the legacy application into enforceable product contracts. It starts with three professional learning paths: concrete root words, plural meaning-building, and short meaning builders.

The V2 preview keeps progress locally per learner profile. Bella receives English guidance, while Ayza receives Bahasa Indonesia learner UI with strict dictionary-parity checks. Adult mode uses the same linguistic truth with quieter presentation. The app has no hidden administrator panel, no account requirement, no cloud progress promise, and no client-side pronunciation scoring.

## Safety decisions

The source audit, learning rules, and architectural decisions are recorded in [`docs/`](docs/). In particular, browser speech recognition is not used for pronunciation assessment. The permanent `ev` regression fixtures and a conservative **Could not assess** state are enforced in tests.

## Verification

| Command | Purpose |
|---|---|
| `pnpm build` | Type checks and produces the production bundle. |
| `pnpm lint:content` | Checks lesson localization, visible builder blocks, soft-g restriction, and declared asset paths. |
| `pnpm test` | Runs SRS, progress, curriculum, localization, and pronunciation regression tests. |

## Development

Run `pnpm install`, then `pnpm dev`. The source repository used as evidence is read-only; V2 is maintained independently in this repository.
