import { unsafeTranscriptWouldPass } from "./pronunciation";

type RecognitionEventLike = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionConstructor = new () => RecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export type TranscriptPracticeResult = { transcript: string; exactReferenceMatch: boolean };

export function speechRecognitionAvailable() { return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition); }

export function transcriptPracticeResult(target: string, transcript: string): TranscriptPracticeResult {
  return { transcript: transcript.trim(), exactReferenceMatch: unsafeTranscriptWouldPass(target, transcript) };
}

export async function captureTurkishTranscript(target: string): Promise<TranscriptPracticeResult> {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) throw new Error("recognition_unsupported");
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("microphone_unsupported");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  try {
    return await new Promise<TranscriptPracticeResult>((resolve, reject) => {
      const recognition = new Recognition();
      recognition.lang = "tr-TR";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      let settled = false;
      let timer = 0;
      const finish = (result: TranscriptPracticeResult) => { if (!settled) { settled = true; window.clearTimeout(timer); resolve(result); } };
      const fail = (error: string) => { if (!settled) { settled = true; window.clearTimeout(timer); reject(new Error(error)); } };
      recognition.onresult = (event) => finish(transcriptPracticeResult(target, event.results[0]?.[0]?.transcript ?? ""));
      recognition.onerror = (event) => fail(event.error ?? "recognition_error");
      recognition.onend = () => { if (!settled) fail("recognition_no_result"); };
      timer = window.setTimeout(() => { try { recognition.stop(); } finally { fail("recognition_timeout"); } }, 8000);
      try { recognition.start(); } catch { fail("recognition_start_failed"); }
    });
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}
