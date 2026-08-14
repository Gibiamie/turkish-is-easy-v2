import type { Locale } from "../types";

type VoiceCopy = {
  heading: string;
  instruction: (target: string) => string;
  boundary: string;
  start: string;
  retry: string;
  listening: (target: string) => string;
  listenModel: string;
  unsupported: { title: string; body: string };
  denied: { title: string; body: string };
  noSpeech: { title: string; body: string };
  device: { title: string; body: string };
  generic: { title: string; body: string };
};

const COPY: Record<Locale, VoiceCopy> = {
  en: {
    heading: "Say the Turkish word once.",
    instruction: (target) => `Tap the microphone, say “${target}” once, then compare what the browser heard with the lesson word.`,
    boundary: "This checks the browser transcript only. It does not score pronunciation or save your voice.",
    start: "Use my microphone",
    retry: "Try the microphone again",
    listening: (target) => `Listening now — say “${target}” once.`,
    listenModel: "Listen to the model recording",
    unsupported: { title: "Voice practice is not available in this browser.", body: "You can still use the Turkish recording and complete the lesson." },
    denied: { title: "Microphone access is turned off.", body: "Allow microphone access in your browser settings, then try again. Your voice was not saved." },
    noSpeech: { title: "I did not hear a word.", body: "Check microphone access, say the Turkish word once, then try again." },
    device: { title: "Your microphone could not start.", body: "Check that another app is not using it, then try again." },
    generic: { title: "Voice practice stopped before a transcript arrived.", body: "Try again, or use the model recording and continue the lesson." },
  },
  id: {
    heading: "Ucapkan kata bahasa Turki satu kali.",
    instruction: (target) => `Tekan mikrofon, ucapkan “${target}” satu kali, lalu bandingkan yang didengar browser dengan kata pelajaran.`,
    boundary: "Fitur ini hanya memeriksa transkrip browser. Ini tidak memberi skor pelafalan atau menyimpan suaramu.",
    start: "Gunakan mikrofon saya",
    retry: "Coba mikrofon lagi",
    listening: (target) => `Sedang mendengarkan — ucapkan “${target}” satu kali.`,
    listenModel: "Dengarkan rekaman contoh",
    unsupported: { title: "Latihan suara tidak tersedia di browser ini.", body: "Kamu tetap dapat memakai rekaman bahasa Turki dan menyelesaikan pelajaran." },
    denied: { title: "Akses mikrofon dimatikan.", body: "Izinkan mikrofon di pengaturan browser, lalu coba lagi. Suaramu tidak disimpan." },
    noSpeech: { title: "Saya tidak mendengar kata.", body: "Periksa akses mikrofon, ucapkan kata bahasa Turki satu kali, lalu coba lagi." },
    device: { title: "Mikrofonmu tidak dapat dimulai.", body: "Pastikan aplikasi lain tidak memakainya, lalu coba lagi." },
    generic: { title: "Latihan suara berhenti sebelum transkrip diterima.", body: "Coba lagi, atau gunakan rekaman contoh lalu lanjutkan pelajaran." },
  },
};

export function voicePracticeCopy(locale: Locale) { return COPY[locale]; }

export function microphoneFeedback(locale: Locale, code: string) {
  const copy = voicePracticeCopy(locale);
  if (["recognition_unsupported", "microphone_unsupported"].includes(code)) return copy.unsupported;
  if (["NotAllowedError", "not-allowed", "permission_denied", "service-not-allowed"].includes(code)) return copy.denied;
  if (["no-speech", "recognition_no_result", "recognition_timeout"].includes(code)) return copy.noSpeech;
  if (["audio-capture", "microphone_unavailable"].includes(code)) return copy.device;
  return copy.generic;
}
