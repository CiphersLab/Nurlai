#!/usr/bin/env node
/**
 * Rebrand pass 2: internal identifiers for the Nurlai fork.
 *
 * Renames package scopes, environment prefixes, domains, bundle ids, image and
 * database role names, and finishes the display-name rename everywhere the
 * first pass did not reach (API, packages, docs, infra, marketing site).
 *
 * Native module names and their Swift/Kotlin classes are intentionally left
 * alone: renaming those requires platform builds we cannot verify here.
 *
 * Usage:
 *   node scripts/rebrand/identifiers.mjs --check
 *   node scripts/rebrand/identifiers.mjs --write
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { extname } from "node:path";

const EXCLUDED_FILES = new Set([
  "LICENSE",
  "NOTICE",
  "CHANGELOG.md",
  "MODIFICATIONS.md",
]);

const EXCLUDED_PREFIXES = ["scripts/rebrand/"];

const EXTENSIONS = new Set([
  "",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".html",
  ".css",
  ".md",
  ".mdx",
  ".po",
  ".pot",
  ".xml",
  ".swift",
  ".kt",
  ".kts",
  ".plist",
  ".strings",
  ".gradle",
  ".svg",
  ".yml",
  ".yaml",
  ".toml",
  ".py",
  ".sh",
  ".fish",
  ".ps1",
  ".txt",
  ".sql",
  ".prisma",
  ".conf",
  ".service",
  ".timer",
  ".desktop",
  ".example",
  ".env",
  ".astro",
  ".jsonc",
  ".grit",
  ".webmanifest",
  ".menu",
  ".topology",
  ".prod",
]);

const REPLACEMENTS = [
  // Domains first, so the generic key rename below cannot eat them.
  ["app.rakazo.com", "app.nurlai.cipherslab.com"],
  ["rakazo.com", "nurlai.cipherslab.com"],

  // Bundle identifiers and Android/iOS namespaces.
  ["com.rakazo", "com.nurlai"],

  // Package scope, environment prefix.
  ["@rakazo/", "@nurlai/"],
  ["RAKAZO_", "NURLAI_"],

  // Images, database roles, dev container.
  ["rakazo/computer", "nurlai/computer"],
  ["rakazo_app", "nurlai_app"],
  ["rakazo-dev-postgres", "nurlai-dev-postgres"],

  // Request headers and renderer globals.
  ["x-rakazo-", "x-nurlai-"],
  ["rakazoDesktop", "nurlaiDesktop"],
  ["rakazoScreen", "nurlaiScreen"],

  // Session and avatar skin tokens.
  ["rakazo.session_token", "nurlai.session_token"],
  [".rakazo-logo-avatar", ".nurlai-logo-avatar"],
  [".rakazo-organic-avatar", ".nurlai-organic-avatar"],

  // Expo identity.
  ['"slug": "rakazo"', '"slug": "nurlai"'],
  ['"scheme": "rakazo"', '"scheme": "nurlai"'],

  // Finish the display rename outside the first pass's scope.
  ["Rakazo", "Nurlai"],
];

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Native file names still start with `Rakazo` (renaming them needs Xcode and
 * Android builds to verify), so any reference to those exact file names has to
 * keep the old prefix even though the display name changed.
 */
const NATIVE_FILE_REFERENCE =
  /Nurlai(Intents|Widgets|FileDropModule|FileDrop|FoldRegionsModule|FoldRegions|ListScrollModule|ListScroll|NetworkCacheModule|NetworkCache|CallService|NotificationService|NotificationsModule|Notifications|IncomingCalls|WorkActivities|PdfViewModule|PdfView|VoiceChatModule|VoiceChat)\.(swift|kt|podspec)/g;

const write = process.argv.includes("--write");

const tracked = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .split("\0")
  .filter(Boolean);

const files = tracked.filter((file) => {
  if (EXCLUDED_FILES.has(file)) return false;
  if (EXCLUDED_PREFIXES.some((prefix) => file.startsWith(prefix))) return false;
  if (!EXTENSIONS.has(extname(file))) return false;
  try {
    return statSync(file).size <= MAX_BYTES;
  } catch {
    return false;
  }
});

let changedFiles = 0;
let changedOccurrences = 0;
const perFile = [];

for (const file of files) {
  const before = readFileSync(file, "utf8");
  if (before.includes("\0")) continue;

  let after = before;
  let count = 0;
  for (const [from, to] of REPLACEMENTS) {
    const parts = after.split(from);
    if (parts.length === 1) continue;
    count += parts.length - 1;
    after = parts.join(to);
  }

  const repaired = after.replace(NATIVE_FILE_REFERENCE, "Rakazo$1.$2");
  if (repaired !== after) {
    count += 1;
    after = repaired;
  }

  if (count === 0) continue;

  changedFiles += 1;
  changedOccurrences += count;
  perFile.push({ file, count });

  if (write) writeFileSync(file, after);
}

perFile.sort((a, b) => b.count - a.count);

console.log(
  `${write ? "Rebranded" : "Would rebrand"} ${changedOccurrences} occurrences in ${changedFiles} files.`,
);
for (const { file, count } of perFile.slice(0, 15)) {
  console.log(`  ${String(count).padStart(4)}  ${file}`);
}
if (perFile.length > 15) console.log(`  ...and ${perFile.length - 15} more files`);

if (!write) console.log("\nDry run only. Re-run with --write to apply.");
