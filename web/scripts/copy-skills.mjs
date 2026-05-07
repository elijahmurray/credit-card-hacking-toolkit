#!/usr/bin/env node
/**
 * copy-skills.mjs — bundle plugin assets into web/.skills/ at build time.
 *
 * Why: Next.js 16 / Turbopack won't trace files outside the project root,
 * so the skill loader can't `fs.readFile("../CLAUDE.md")` directly on Vercel.
 * We copy the source-of-truth files into web/.skills/ at prebuild time.
 *
 * The .skills/ directory is gitignored — it's a build artifact, not source.
 *
 * Run: `npm run build` (auto, via prebuild hook) or `node scripts/copy-skills.mjs`
 */

import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
const WEB_ROOT = resolve(__dirname, "..");
const DEST = join(WEB_ROOT, ".skills");

const COPIES = [
  // CLAUDE.md (single file)
  { from: join(REPO_ROOT, "CLAUDE.md"), to: join(DEST, "CLAUDE.md") },
  // All skill SKILL.md files (preserve directory structure)
  { fromDir: join(REPO_ROOT, "plugins", "credit-card-hacker", "skills"), toDir: join(DEST, "skills"), match: (p) => p.endsWith("SKILL.md") },
  // All data JSON files
  { fromDir: join(REPO_ROOT, "data"), toDir: join(DEST, "data"), match: (p) => p.endsWith(".json") },
];

async function copyTreeMatching(fromDir, toDir, match) {
  const entries = await readdir(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    const src = join(fromDir, entry.name);
    const dst = join(toDir, entry.name);
    if (entry.isDirectory()) {
      await mkdir(dst, { recursive: true });
      await copyTreeMatching(src, dst, match);
    } else if (match(src)) {
      await mkdir(dirname(dst), { recursive: true });
      await copyFile(src, dst);
    }
  }
}

async function main() {
  // Clean destination
  try {
    await rm(DEST, { recursive: true, force: true });
  } catch {
    /* ok */
  }
  await mkdir(DEST, { recursive: true });

  for (const copy of COPIES) {
    if (copy.from && copy.to) {
      try {
        await stat(copy.from);
      } catch {
        console.warn(`[copy-skills] missing: ${copy.from}`);
        continue;
      }
      await mkdir(dirname(copy.to), { recursive: true });
      await copyFile(copy.from, copy.to);
      console.log(`[copy-skills] file: ${copy.from} → ${copy.to}`);
    } else if (copy.fromDir && copy.toDir) {
      try {
        await stat(copy.fromDir);
      } catch {
        console.warn(`[copy-skills] missing dir: ${copy.fromDir}`);
        continue;
      }
      await copyTreeMatching(copy.fromDir, copy.toDir, copy.match);
      console.log(`[copy-skills] dir:  ${copy.fromDir} → ${copy.toDir}`);
    }
  }
}

main().catch((err) => {
  console.error("[copy-skills] failed:", err);
  process.exit(1);
});
