import type { CardHackerProfile } from "@/lib/types";
import { loadSkills, type LoadedSkills } from "./skill-loader";

/**
 * The Anthropic provider supports `cache_control` markers on individual content
 * blocks of the system prompt. We split the system prompt into:
 *   1. STATIC block (CLAUDE.md + skill index + skill bodies) — cacheable
 *   2. DYNAMIC block (user profile JSON) — not cached
 *
 * Vercel AI SDK lets us pass `system` either as a plain string OR as an array
 * of message-content parts via the `messages` array with role "system". For
 * cache_control, the cleanest path is to pass the full prompt as a single
 * string and let the Anthropic provider attach cache_control to the system
 * field via providerOptions. Right now (@ai-sdk/anthropic ^1.0.0) the
 * recommended pattern is to send the static portion via a system message with
 * `providerOptions.anthropic.cacheControl`.
 *
 * For MVP we return both:
 *   - `system`: the dynamic profile string (per-user, cheap)
 *   - `staticSystem`: the big static block (cacheable via providerOptions)
 *
 * The route handler concatenates them via the AI SDK's `system` parameter and
 * cache_control marker.
 */

export interface BuildSystemPromptArgs {
  profile: CardHackerProfile | Record<string, unknown> | null;
}

export interface BuiltSystemPrompt {
  /** Big static portion (CLAUDE.md + all skills). Send with cache_control. */
  staticSystem: string;
  /** Small dynamic portion (user profile). Not cached. */
  dynamicSystem: string;
  /** Convenience: full string concatenation if you don't care about caching. */
  system: string;
  /** Approximate input-token count for the static block (rough: chars/4). */
  approxStaticTokens: number;
}

export async function buildSystemPrompt(
  args: BuildSystemPromptArgs,
): Promise<BuiltSystemPrompt> {
  const skills = await loadSkills();
  const staticSystem = renderStatic(skills);
  const dynamicSystem = renderProfile(args.profile);
  const system = `${staticSystem}\n\n${dynamicSystem}`;
  return {
    staticSystem,
    dynamicSystem,
    system,
    approxStaticTokens: Math.ceil(staticSystem.length / 4),
  };
}

function renderStatic(skills: LoadedSkills): string {
  const parts: string[] = [];

  // 1. CLAUDE.md body (no frontmatter — already stripped).
  parts.push(skills.claudeMd.trim());

  // 2. Skill index (name + description). Cheap, lets the model decide which
  //    bodies are most relevant.
  parts.push("## Available skills");
  parts.push(
    "Each skill below has a body included later in this prompt. Names match what's referenced in the CLAUDE.md.",
  );
  for (const s of skills.skills) {
    parts.push(`- **${s.name}** — ${s.description}`);
  }

  // 3. Full skill bodies. Yes, this is large; prompt caching is mandatory.
  parts.push("## Skill bodies");
  parts.push(
    "Below are the full SKILL.md bodies for every skill listed above. Reference them when relevant; quote rules verbatim when the user asks about an application gate, family lockout, or eligibility window.",
  );
  for (const s of skills.skills) {
    parts.push(`### Skill: ${s.name}\n\n${s.body.trim()}`);
  }

  return parts.join("\n\n");
}

function renderProfile(
  profile: CardHackerProfile | Record<string, unknown> | null,
): string {
  if (!profile || Object.keys(profile).length === 0) {
    return [
      "## User profile",
      "Profile not yet built — guide the user through `/credit-card-hacker:getting-started` before recommending any card. Do not invent profile fields.",
    ].join("\n\n");
  }
  return [
    "## User profile",
    "The user's stored profile (from the `profiles.data` jsonb column) is below. Treat this as authoritative for 5/24 count, Amex history, family clocks, and goals. If a field looks stale (>90 days since last_updated), prepend the staleness warning per the next-card skill.",
    "```json",
    JSON.stringify(profile, null, 2),
    "```",
  ].join("\n\n");
}
