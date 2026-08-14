import { useEffect, useState } from "react";

import { captureTurkishTranscript, recordVoiceSnippet, speechRecognitionAvailable, type TranscriptPracticeResult } from "./microphone";
import type { Lesson, Locale } from "../types";

type CoachCopy = {
  title: string;
  intro: (target: string) => string;
  stepModel: string;
  stepRecord: string;
  stepListen: string;
  stepCheck: string;
  record: string;
  recording: string;
  replay: string;
  optionalTranscript: string;
  checking: string;
  recorded: string;
  transcriptUnavailable: string;
  boundary: string;
  microphoneError: string;
};

const COPY: Record<Locale, CoachCopy> = {
  en: {
    title: "Practise the sound, then listen back.",
    intro: (target) => `Work with “${target}” in four small steps. You can complete the practice even when browser speech-to-text is unavailable.`,
    stepModel: "Listen to the Turkish model once.",
    stepRecord: "Say the word slowly two times: once naturally, then once more slowly.",
    stepListen: "Listen back and compare your rhythm and vowels with the model recording.",
    stepCheck: "If you want, let the browser write what it heard. This is optional.",
    record: "Record my voice for 3 seconds",
    recording: "Recording… say it twice, then wait.",
    replay: "Listen back to my recording",
    optionalTranscript: "Optional: check what the browser heard",
    checking: "Checking the browser transcript…",
    recorded: "Your recording is ready. Listen back before you continue.",
    transcriptUnavailable: "Your recording still worked. This browser did not return a transcript, so use the two recordings to compare the sound instead.",
    boundary: "This is guided self-practice. It never claims to score your pronunciation and your recording stays in this browser session.",
    microphoneError: "The microphone could not start. Allow microphone access, close any app using it, then try recording again.",
  },
  id: {
    title: "Latih bunyinya, lalu dengarkan kembali.",
    intro: (target) => `Latih “${target}” dalam empat langkah kecil. Kamu tetap dapat menyelesaikan latihan meskipun browser tidak menyediakan teks dari suara.`,
    stepModel: "Dengarkan contoh bahasa Turki satu kali.",
    stepRecord: "Ucapkan kata itu perlahan dua kali: sekali normal, lalu sekali lebih pelan.",
    stepListen: "Dengarkan kembali dan bandingkan ritme serta vokalmu dengan rekaman contoh.",
    stepCheck: "Jika mau, biarkan browser menulis yang didengarnya. Langkah ini opsional.",
    record: "Rekam suara saya selama 3 detik",
    recording: "Merekam… ucapkan dua kali, lalu tunggu.",
    replay: "Dengarkan kembali rekaman saya",
    optionalTranscript: "Opsional: periksa yang didengar browser",
    checking: "Memeriksa transkrip browser…",
    recorded: "Rekamanmu siap. Dengarkan kembali sebelum melanjutkan.",
    transcriptUnavailable: "Rekamanmu tetap berhasil. Browser ini tidak mengembalikan transkrip, jadi bandingkan bunyinya lewat dua rekaman.",
    boundary: "Ini latihan mandiri terpandu. Fitur ini tidak mengaku memberi skor pelafalan dan rekamanmu hanya tersimpan selama sesi browser ini.",
    microphoneError: "Mikrofon tidak dapat dimulai. Izinkan mikrofon, tutup aplikasi lain yang memakainya, lalu coba rekam lagi.",
  },
};

function PlayButton({ src, label }: { src: string; label: string }) {
  const [playing, setPlaying] = useState(false);
  const play = () => { const audio = new Audio(src); audio.onended = () => setPlaying(false); audio.onerror = () => setPlaying(false); void audio.play(); setPlaying(true); };
  return <button className="audio-button" aria-label={label} onClick={play}>{playing ? "▮▮" : "▶"} {label}</button>;
}

export function SpeakingCoach({ lesson, locale }: { lesson: Lesson; locale: Locale }) {
  const copy = COPY[locale];
  const [recordingUrl, setRecordingUrl] = useState("");
  const [state, setState] = useState<"ready" | "recording" | "recorded" | "error">("ready");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState<TranscriptPracticeResult | null>(null);
  const [transcriptState, setTranscriptState] = useState<"idle" | "checking" | "unavailable">("idle");

  useEffect(() => () => { if (recordingUrl) URL.revokeObjectURL(recordingUrl); }, [recordingUrl]);

  const record = async () => {
    setState("recording"); setError(""); setTranscript(null); setTranscriptState("idle");
    try {
      const nextUrl = await recordVoiceSnippet(3000);
      setRecordingUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return nextUrl; });
      setState("recorded");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "recording_error");
      setState("error");
    }
  };

  const checkTranscript = async () => {
    if (!speechRecognitionAvailable()) { setTranscriptState("unavailable"); return; }
    setTranscriptState("checking"); setTranscript(null);
    try { setTranscript(await captureTurkishTranscript(lesson.finalWord)); setTranscriptState("idle"); }
    catch { setTranscriptState("unavailable"); }
  };

  return <section className="pronunciation-card speaking-coach">
    <p className="eyebrow dark">{locale === "en" ? "SAY IT" : "UCAPKAN"}</p>
    <h2>{copy.title}</h2>
    <p>{copy.intro(lesson.finalWord)}</p>
    <ol className="coach-steps">
      <li><span>1</span><div><strong>{copy.stepModel}</strong>{lesson.audio ? <PlayButton src={lesson.audio.path} label={locale === "en" ? "Listen to the Turkish model" : "Dengarkan contoh bahasa Turki"} /> : null}</div></li>
      <li><span>2</span><div><strong>{copy.stepRecord}</strong><p>{lesson.learnWhy.hear[locale]}</p></div></li>
      <li><span>3</span><div><strong>{copy.stepListen}</strong><p>{lesson.learnWhy.commonMistake[locale]}</p></div></li>
      <li><span>4</span><div><strong>{copy.stepCheck}</strong></div></li>
    </ol>
    <div className="coach-actions">
      <button className="secondary" onClick={() => void record()} disabled={state === "recording"}>{state === "recording" ? copy.recording : copy.record}</button>
      {recordingUrl ? <PlayButton src={recordingUrl} label={copy.replay} /> : null}
    </div>
    {state === "recorded" ? <p className="coach-success" role="status">{copy.recorded}</p> : null}
    {state === "error" ? <p className="coach-error" role="status">{copy.microphoneError}</p> : null}
    <div className="transcript-check">
      <button className="text-button" onClick={() => void checkTranscript()} disabled={transcriptState === "checking"}>{transcriptState === "checking" ? copy.checking : copy.optionalTranscript}</button>
      {transcript ? <p className="transcript-feedback" role="status">{locale === "en" ? `The browser heard: “${transcript.transcript || "—"}”. ${transcript.exactReferenceMatch ? "It matches the reference text." : "Use this as a transcript cue only, then compare your recording with the model."}` : `Browser mendengar: “${transcript.transcript || "—"}”. ${transcript.exactReferenceMatch ? "Teksnya cocok dengan kata acuan." : "Gunakan ini hanya sebagai petunjuk transkrip, lalu bandingkan rekamanmu dengan contoh."}`}</p> : null}
      {transcriptState === "unavailable" ? <p className="coach-muted" role="status">{copy.transcriptUnavailable}</p> : null}
    </div>
    <p className="privacy-notice">{copy.boundary}</p>
  </section>;
}
