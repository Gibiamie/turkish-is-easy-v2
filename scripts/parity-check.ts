import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { V1_PARITY_BASELINE } from "../src/content/v1-parity-baseline";
import * as v2 from "../src/content/curriculum";

const v2Topics = v2.TOPICS as Array<{ id: string; lessons: Array<{ id: string; verifiedAudio?: string }> }>;
const v2Items = v2.ALL_LESSONS as Array<{ id: string; verifiedAudio?: string }>;
const v2AudioRoot = resolve(process.cwd(), "public/audio");
const v2AudioFiles = existsSync(v2AudioRoot) ? readdirSync(v2AudioRoot).filter((name) => name.endsWith(".mp3")) : [];
const v1Topics = [...V1_PARITY_BASELINE.topicIds];
const v1Items = [...V1_PARITY_BASELINE.lessonIds];
const missingTopics = v1Topics.filter((id) => !v2Topics.some((candidate) => candidate.id === id));
const missingItems = v1Items.filter((id) => !v2Items.some((candidate) => candidate.id === id));
const missingVerifiedAudio = V1_PARITY_BASELINE.verifiedAudioPaths.filter((path) => !existsSync(resolve(process.cwd(), "public", path)));
const status = (v2Value: number, v1Value: number) => v2Value >= v1Value ? "PASS" : "FAIL";

const inventory = {
  generatedAt: new Date().toISOString(),
  v1: { topics: v1Topics.length, nonReviewItems: v1Items.length, audioFiles: V1_PARITY_BASELINE.audioFiles.length, referencedAudioMappings: V1_PARITY_BASELINE.referencedAudioPaths.length, ownerVerifiedAudio: V1_PARITY_BASELINE.verifiedAudioPaths.length, profiles: V1_PARITY_BASELINE.profileCount },
  v2: { topics: v2Topics.length, items: v2Items.length, audioFiles: v2AudioFiles.length, ownerVerifiedAudio: new Set(v2Items.flatMap((item) => item.verifiedAudio ? [item.verifiedAudio] : [])).size, profiles: (v2.PROFILES as unknown[]).length },
  missingTopics, missingItems, missingVerifiedAudio,
  parity: { topics: status(v2Topics.length, v1Topics.length), items: status(v2Items.length, v1Items.length), sourceAudioFiles: status(v2AudioFiles.length, V1_PARITY_BASELINE.audioFiles.length), ownerVerifiedAudio: status(new Set(v2Items.flatMap((item) => item.verifiedAudio ? [item.verifiedAudio] : [])).size, V1_PARITY_BASELINE.verifiedAudioPaths.length) },
};

mkdirSync(resolve(process.cwd(), "docs"), { recursive: true });
writeFileSync(resolve(process.cwd(), "docs/v1-v2-parity.json"), `${JSON.stringify(inventory, null, 2)}\n`);
const table = [
  ["Topics", inventory.v1.topics, inventory.v2.topics, inventory.parity.topics],
  ["Non-review learning items", inventory.v1.nonReviewItems, inventory.v2.items, inventory.parity.items],
  ["Audio MP3 assets", inventory.v1.audioFiles, inventory.v2.audioFiles, inventory.parity.sourceAudioFiles],
  ["Referenced V1 audio mappings", inventory.v1.referencedAudioMappings, inventory.v2.audioFiles, inventory.parity.sourceAudioFiles],
  ["Owner-verified audio mappings", inventory.v1.ownerVerifiedAudio, inventory.v2.ownerVerifiedAudio, inventory.parity.ownerVerifiedAudio],
  ["Profiles", inventory.v1.profiles, inventory.v2.profiles, status(inventory.v2.profiles, inventory.v1.profiles)],
].map((row) => `| ${row.join(" | ")} |`).join("\n");
writeFileSync(resolve(process.cwd(), "docs/V1-V2-PARITY.md"), `# V1 → V2 Parity Inventory\n\n> This report compares the current V2 source with a version-controlled, machine-generated V1 baseline from the read-only V1 repository. Regenerate the baseline only after a verified source audit.\n\n| Capability | V1 | Current V2 | Status |\n| --- | ---: | ---: | --- |\n${table}\n\n## Required V1 topics not yet represented\n\n${missingTopics.length ? missingTopics.map((id) => `- \`${id}\``).join("\n") : "None."}\n\n## Missing V1 learning items\n\n${missingItems.length} items are not yet present in V2. The JSON inventory contains their exact IDs.\n\n## Missing owner-verified audio\n\n${missingVerifiedAudio.length ? missingVerifiedAudio.map((path) => `- \`${path}\``).join("\n") : "None."}\n\n## Release determination\n\n**${Object.values(inventory.parity).every((result) => result === "PASS") ? "PARITY PASS" : "PARITY FAIL"}** — recovery work remains mandatory until all baseline rows pass without an owner-approved exclusion.\n`);

console.log(JSON.stringify({ report: "docs/V1-V2-PARITY.md", ...inventory }, null, 2));
if (process.env.PARITY_STRICT === "1" && Object.values(inventory.parity).some((result) => result === "FAIL")) process.exit(1);
