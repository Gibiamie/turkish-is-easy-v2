import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ALL_LESSONS } from "../src/content/curriculum";
import { assertLocaleParity } from "../src/i18n";
const problems: string[] = [];
for (const lesson of ALL_LESSONS) { if (!lesson.prompt.en || !lesson.prompt.id || !lesson.meaning.en || !lesson.meaning.id) problems.push(`${lesson.id}: missing locale content`); if (lesson.kind === "builder" && !lesson.answerParts.every((part) => lesson.options.includes(part))) problems.push(`${lesson.id}: missing answer block`); if (lesson.finalWord === "ğ") problems.push(`${lesson.id}: isolated soft g`); if (!existsSync(resolve("public", `.${lesson.image}`))) problems.push(`${lesson.id}: image not found`); if (lesson.verifiedAudio && !existsSync(resolve("public", `.${lesson.verifiedAudio}`))) problems.push(`${lesson.id}: verified audio not found`); }
if (!assertLocaleParity()) problems.push("UI locale keys differ");
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`Content QA passed for ${ALL_LESSONS.length} lessons.`);
