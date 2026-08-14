# Turkish Acoustic Assessment Research

## Decision

V2 exposes **microphone-guided speaking practice** now, but it does not convert browser transcription into a pronunciation score. Browser recognition can provide a transcript for a precise, conservative practice cue; it is not acoustic evidence of phoneme accuracy. In particular, the `ev` contract requires an exact `ev` transcript to be eligible for a recognition-match outcome, while `ey`, `at`, `et`, `el`, `e`, and `evet` are permanent non-passing cases.

## Real acoustic provider candidate

Azure Speech Pronunciation Assessment is the candidate for a future server-backed integration. Its official documentation describes a separate pronunciation-assessment speech model, configurable reference text, and phoneme/word/full-text granularity. The responsible-AI documentation also states that real-world performance depends on speech-to-text accuracy, microphone/audio quality, scenario-specific evaluation, and appropriately selected thresholds. It recommends that customers test their own target scenario before use.[1][2]

The current V2 static PWA intentionally does not ship a provider secret, direct client credential, or unaudited score. Before enabling acoustic scoring, the project needs a backend proxy, an Azure key stored server-side, a documented `tr-TR` support confirmation at integration time, and a test corpus including native/learner recordings for the `ev` regression cases. The provider result must remain clearly labelled as an **acoustic assessment**, distinct from the transcript-match practice cue.

## Acceptance gate for future integration

| Gate | Required evidence |
| --- | --- |
| Locale | Official provider documentation and live tenant verification for `tr-TR`. |
| Security | Server-side key only; no secret in the PWA bundle or repository. |
| Regression corpus | Correct `ev` may pass; `ey`, `at`, `et`, `el`, `e`, and `evet` must not pass. |
| Calibration | Owner-reviewed recordings for children and adults with documented thresholds. |
| UX | Clear fallback when microphone access, network, provider, or score is unavailable. |

## References

[1] [Azure Speech: Pronunciation assessment](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)

[2] [Azure Speech: Pronunciation Assessment characteristics and limitations](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/pronunciation-assessment/characteristics-and-limitations-pronunciation-assessment)
