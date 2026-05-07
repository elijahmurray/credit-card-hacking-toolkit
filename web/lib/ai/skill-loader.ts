import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Loads CLAUDE.md and all SKILL.md files from the plugin directory at module
 * init time, then memoizes the result. Server-only — depends on fs access.
 *
 * Path assumption: process.cwd() is the `web/` directory in dev and on Vercel
 * (Vercel projects with rootDirectory=web treat web/ as the project root).
 * That means the plugin files live one directory up.
 */

export interface LoadedSkill {
  name: string;
  description: string;
  body: string;
}

export interface LoadedSkills {
  claudeMd: string;
  skills: LoadedSkill[];
}

const REPO_ROOT = path.join(process.cwd(), "..");
const CLAUDE_MD_PATH = path.join(REPO_ROOT, "CLAUDE.md");
const SKILLS_DIR = path.join(
  REPO_ROOT,
  "plugins",
  "credit-card-hacker",
  "skills",
);

let cache: Promise<LoadedSkills> | null = null;

export async function loadSkills(): Promise<LoadedSkills> {
  if (cache) return cache;
  cache = doLoad();
  return cache;
}

async function doLoad(): Promise<LoadedSkills> {
  const [claudeMdRaw, skillDirs] = await Promise.all([
    fs.readFile(CLAUDE_MD_PATH, "utf8"),
    fs.readdir(SKILLS_DIR, { withFileTypes: true }),
  ]);

  const claudeMd = stripFrontmatter(claudeMdRaw);

  const skills: LoadedSkill[] = [];
  for (const entry of skillDirs) {
    if (!entry.isDirectory()) continue;
    const skillPath = path.join(SKILLS_DIR, entry.name, "SKILL.md");
    let raw: string;
    try {
      raw = await fs.readFile(skillPath, "utf8");
    } catch {
      // Skip directories without a SKILL.md
      continue;
    }
    const { frontmatter, body } = splitFrontmatter(raw);
    const name = frontmatter.name ?? entry.name;
    const description = frontmatter.description ?? "";
    skills.push({ name, description, body });
  }
  // Stable ordering, alphabetical by name.
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return { claudeMd, skills };
}

function stripFrontmatter(src: string): string {
  return splitFrontmatter(src).body;
}

function splitFrontmatter(src: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  if (!src.startsWith("---")) {
    return { frontmatter: {}, body: src };
  }
  const end = src.indexOf("\n---", 3);
  if (end === -1) {
    return { frontmatter: {}, body: src };
  }
  const header = src.slice(3, end).trim();
  const body = src.slice(end + 4).replace(/^\r?\n/, "");
  const frontmatter: Record<string, string> = {};
  for (const line of header.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    // Strip surrounding quotes if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[m[1]] = value;
  }
  return { frontmatter, body };
}

/**
 * Test/dev hook: clear the memoized result so the next loadSkills() re-reads
 * from disk. Useful in dev where the underlying files change.
 */
export function _clearSkillCache(): void {
  cache = null;
}
