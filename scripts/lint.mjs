import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const files = execFileSync("git", ["ls-files", "*.ts", "*.tsx", "*.js", "*.mjs"], { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);

for (const file of files) {
  const source = await readFile(file, "utf8");
  assert.doesNotMatch(source, /[ \t]+$/m, `${file}: espace final interdit`);
  assert.doesNotMatch(source, /sb_secret_[A-Za-z0-9_-]{10,}/, `${file}: secret Supabase interdit`);
  assert.doesNotMatch(source, /try\s*\{\s*(?:await\s+)?import\b/, `${file}: import dans try/catch interdit`);
}

console.log(`${files.length} fichiers contrôlés.`);
