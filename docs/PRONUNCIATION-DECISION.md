# V2 Pronunciation Safety Decision

> Browser `SpeechRecognition` and ordinary speech-to-text transcripts are not pronunciation assessment. V2 will not mark pronunciation correct from a transcript.

Microsoft’s official assessment guidance says it can return phoneme-level data for supported locales. Its current supported-language table lists 33 locales, but not Turkish (`tr-TR`). Microsoft’s Turkish transcription support is therefore not evidence of Turkish pronunciation-assessment capability. Other reviewed provider documentation did not establish Turkish scoring support either.

V2 retains an explicit future-provider boundary. Until an owner-approved provider is benchmarked on Turkish recordings and hard negative fixtures, the only learner-facing result is **Could not assess**. This preview never records or sends voice data.

| Regression | Required V2 behavior |
|---|---|
| `ev` → `ev` | May pass only through a validated Turkish acoustic provider. |
| `ev` → `ey`, `at`, `et`, `el`, `e`, `evet` | Must never pass. |
| Silence, noise, unavailable provider | `Could not assess`; never a guessed retry or pass. |
