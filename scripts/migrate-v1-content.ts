import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type Localized = { en: string; id: string };
type SourceItem = { id: string; topicId?: string; word?: string; letter?: string; finalWord?: string; prompt?: Localized; meaning?: Localized; target?: Localized; explanationKey?: string; audio?: string | null; mainAudio?: string | null; exampleAudio?: string | null; exampleWord?: string; image?: string | null; answerParts?: string[]; options?: string[]; emoji?: string; digit?: string; swatch?: string; extraExamples?: Array<{ audio?: string }> };
type SourceTopic = { id: string; type: string; section: string; title: Localized; sub: Localized };

const v1Root = resolve(process.cwd(), "../source-turkish-is-easy");
const source = await import(pathToFileURL(join(v1Root, "js/lessonData.js")).href) as { TOPICS: SourceTopic[]; datasetFor: (topicId: string) => SourceItem[]; EXPLANATIONS: Record<string, { main: Localized; hear: Localized; mistake: Localized; practice: { en: string[]; id: string[] } }> };
const registry = await import(pathToFileURL(join(v1Root, "js/audioRegistry.js")).href) as { isPronunciationVerified: (path: string) => boolean };
const base = "/turkish-is-easy-v2/";
const imagePath = (value?: string | null) => value ? `${base}assets/${value.replace(/^images\//, "")}` : "";
const audioFor = (item: SourceItem) => item.audio || item.mainAudio || item.exampleAudio || null;
const labelFor = (item: SourceItem) => item.finalWord || item.word || item.letter || "";

function sourceAudio(item: SourceItem) {
  const path = audioFor(item);
  if (!path) return undefined;
  return { path: `${base}${path}`, verification: registry.isPronunciationVerified(path) ? "owner_verified" : "human_unverified" };
}

function hintFor(item: SourceItem, topic: SourceTopic): Localized[] {
  if (topic.type === "builder") return [{ en: "Build the meaning one small block at a time.", id: "Susun maknanya satu blok kecil pada satu waktu." }];
  if (topic.id === "alphabet") return [{ en: "Listen closely, then notice how the sound feels.", id: "Dengarkan dengan saksama, lalu perhatikan bunyinya." }];
  return [{ en: "Look at the picture or context, then try the Turkish word.", id: "Lihat gambar atau konteksnya, lalu coba kata Turkinya." }];
}

function guideFor(item: SourceItem, topic: SourceTopic) {
  const explanation = item.explanationKey ? source.EXPLANATIONS[item.explanationKey] : undefined;
  if (explanation) return { keyIdea: explanation.main, hear: explanation.hear, commonMistake: explanation.mistake, miniPractice: explanation.practice };
  const word = labelFor(item);
  const enMeaning = item.meaning?.en ?? item.prompt?.en ?? item.target?.en ?? "this idea";
  const idMeaning = item.meaning?.id ?? item.prompt?.id ?? item.target?.id ?? "makna ini";
  return {
    keyIdea: { en: `${word} connects to ${enMeaning}.`, id: `${word} berhubungan dengan ${idMeaning}.` },
    hear: { en: "Listen first, then repeat at a comfortable pace.", id: "Dengarkan dulu, lalu ulangi dengan tempo yang nyaman." },
    commonMistake: { en: "Use the picture and sound as clues before choosing.", id: "Gunakan gambar dan bunyi sebagai petunjuk sebelum memilih." },
    miniPractice: { en: [`Listen to ${word}.`, "Say it once.", "Try the next step."], id: [`Dengarkan ${word}.`, "Ucapkan sekali.", "Coba langkah berikutnya."] },
  };
}

function transform(topic: SourceTopic, item: SourceItem, index: number, candidates: SourceItem[]) {
  const word = item.id === "alpha_soft_g" ? (item.exampleWord ?? "dağ") : labelFor(item);
  const isBuilder = topic.type === "builder";
  const distractors = candidates.map(labelFor).filter((candidate) => candidate && candidate !== word).slice(0, 3);
  const options = item.options?.length ? item.options : [word, ...distractors].slice(0, 4);
  return {
    id: item.id,
    kind: isBuilder ? "builder" : "recognition",
    prompt: isBuilder ? (item.prompt ?? { en: "Build the meaning", id: "Susun maknanya" }) : { en: `Learn ${word}`, id: `Pelajari ${word}` },
    finalWord: word,
    meaning: item.meaning ?? item.prompt ?? item.target ?? { en: word, id: word },
    options,
    answerParts: item.answerParts?.length ? item.answerParts : [word],
    image: imagePath(item.image),
    hint: hintFor(item, topic),
    learnWhy: guideFor(item, topic),
    audio: sourceAudio(item),
    verifiedAudio: sourceAudio(item)?.verification === "owner_verified" ? sourceAudio(item)?.path : undefined,
  };
}

const migratedTopics = source.TOPICS.map((topic, index) => {
  const records = source.datasetFor(topic.id);
  return {
    id: topic.id,
    title: topic.title,
    description: topic.sub,
    level: index + 1,
    gradient: ["sky", "sun", "mint", "rose"][index % 4],
    lessons: records.map((item, itemIndex) => transform(topic, item, itemIndex, records)),
  };
});

const sourceFile = `/* This file is generated from the read-only V1 source. Run pnpm migrate:v1 after validated V1 content changes. */\nimport type { Topic } from "../types";\n\nexport const MIGRATED_V1_TOPICS = ${JSON.stringify(migratedTopics, null, 2)} satisfies Topic[];\nexport const MIGRATED_V1_LESSON_COUNT = ${migratedTopics.reduce((sum, topic) => sum + topic.lessons.length, 0)};\n`;
mkdirSync(resolve(process.cwd(), "src/content"), { recursive: true });
writeFileSync(resolve(process.cwd(), "src/content/v1-migrated.ts"), sourceFile);
console.log(`Migrated ${migratedTopics.length} topics and ${migratedTopics.reduce((sum, topic) => sum + topic.lessons.length, 0)} lessons from V1.`);
