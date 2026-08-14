import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type SourceTopic = { id: string };
type SourceLesson = { id: string };

const v1Root = resolve(process.cwd(), "../source-turkish-is-easy");
if (!existsSync(v1Root)) throw new Error("Read-only V1 source is required only to regenerate the committed parity baseline.");

const lessons = await import(pathToFileURL(join(v1Root, "js/lessonData.js")).href) as { TOPICS: SourceTopic[]; allLessonItems: () => SourceLesson[] };
const audio = await import(pathToFileURL(join(v1Root, "js/audioRegistry.js")).href) as { audioAuditRows: () => Array<{ path: string; pronunciationVerified: boolean }> };
const profiles = await import(pathToFileURL(join(v1Root, "js/profiles.js")).href) as { PROFILES: unknown[] };
const audioRows = audio.audioAuditRows();

const baseline = {
  generatedFrom: "read-only V1 source",
  topicIds: lessons.TOPICS.map((topic) => topic.id).sort(),
  lessonIds: lessons.allLessonItems().map((lesson) => lesson.id).sort(),
  audioFiles: readdirSync(join(v1Root, "audio")).filter((file) => file.endsWith(".mp3")).sort(),
  referencedAudioPaths: [...new Set(audioRows.map((row) => row.path).filter(Boolean))].sort(),
  verifiedAudioPaths: [...new Set(audioRows.filter((row) => row.pronunciationVerified).map((row) => row.path))].sort(),
  profileCount: profiles.PROFILES.length,
};

const output = `/** AUTO-GENERATED from the read-only V1 repository. Do not edit manually. */\nexport const V1_PARITY_BASELINE = ${JSON.stringify(baseline, null, 2)} as const;\n`;
writeFileSync(resolve(process.cwd(), "src/content/v1-parity-baseline.ts"), output);
console.log(`Wrote V1 parity baseline: ${baseline.topicIds.length} topics, ${baseline.lessonIds.length} lessons, ${baseline.audioFiles.length} audio files.`);
