import { loadSkills } from "./skill-loader";

/**
 * System prompt for the onboarding chat. Distinct from the main chat prompt:
 *  - Forces the agent to run the `getting-started` Q&A flow.
 *  - Instructs the agent to emit a single ```json fenced block containing the
 *    full CardHackerProfile when (and only when) it has gathered everything.
 *  - The route handler watches for that block in the streamed text and writes
 *    it to `profiles.data` server-side.
 *
 * We bias toward a small, focused prompt rather than dumping every skill body —
 * onboarding only needs `getting-started`. The big static block (CLAUDE.md +
 * 28 skills) lives in the main chat prompt.
 */

export interface BuiltOnboardingPrompt {
  /** Big static portion (CLAUDE.md + getting-started skill). Cacheable. */
  staticSystem: string;
  /** Small dynamic portion (existing partial profile, if any). Not cached. */
  dynamicSystem: string;
}

const COMPLETION_INSTRUCTIONS = `
## Completion protocol (CRITICAL — read this carefully)

When (and ONLY when) you have gathered enough information across all 7 batches
to construct a valid CardHackerProfile, OR the user explicitly says they are
done / want to skip the rest, you MUST end your final assistant message with a
single fenced JSON code block containing the full profile object. Format:

\`\`\`json
{
  "schema_version": 1,
  "last_updated": "YYYY-MM-DD",
  "household": { ... },
  "credit_posture": { ... },
  "cards": [ ... ],
  "amex_history": [ ... ],
  "gates": { ... },
  "earning": { ... },
  "points": { ... },
  "loyalty": { ... },
  "goals": { ... }
}
\`\`\`

Rules for the JSON block:
- Use the EXACT shape from \`getting-started\`'s "Profile schema" section.
- \`schema_version\` MUST be the integer 1.
- \`last_updated\` MUST be today's date in YYYY-MM-DD format.
- For unknown / skipped fields, use \`null\` (or \`[]\` / \`{}\` as the schema dictates).
- It MUST be valid JSON — no trailing commas, no comments.
- Emit it ONLY ONCE, in the message where you confirm to the user that they're set.
- Do NOT emit a partial \`\`\`json block in any earlier message. The route parses
  the first fenced \`\`\`json block in the assistant text and treats it as the
  final profile. A premature partial will be persisted and the user will be
  marked onboarded with a half-built profile.

Before emitting the JSON block, give the user a short plain-text summary of
what you captured (e.g., a compact bulleted recap of card count, 5/24 count,
goals). After the JSON block, add one short closing line like "Profile saved —
you're all set. Head to /chat and ask me what to apply for next."
`.trim();

const ONBOARDING_BIAS = `
You are running the **onboarding** flow for a brand-new user. The user just
signed up and has NO profile yet. Your sole job for this conversation is to run
the \`getting-started\` skill end-to-end and produce a valid CardHackerProfile
JSON object.

Behavior overrides for this session ONLY:
- The PRE-OUTPUT GATE in CLAUDE.md does NOT apply. \`getting-started\` is the
  documented exception — sequential clarifying questions are required and
  expected.
- Open with a short, friendly intro (1–2 sentences) explaining what's about to
  happen: ~7 short batches of questions covering household, credit, current
  cards, gates, earning, points, and goals. Tell them they can say "skip" on
  any question.
- Then ask Batch 1 immediately. Do not wait for permission.
- Run batches in order: 1 household, 2 credit posture, 3 current cards,
  4 derived gates (compute and confirm — don't just ask), 5 earning,
  6 points/loyalty, 7 goals.
- Ask each batch as a numbered list, 3–5 questions per batch. Wait for the
  user's reply before moving to the next batch.
- If the user pastes an AwardWallet export or a long card list, parse it inline
  and confirm what you extracted before moving on.
- If the user says "skip" or "I don't know", record \`null\` and continue.
- After Batch 3 (cards), explicitly compute the 5/24 count and Amex history
  list and show them back to the user for confirmation before the rest of the
  gates batch.
- DO NOT make card recommendations during onboarding. If the user asks "what
  should I get next?" mid-flow, defer with: "I'll answer that as soon as we
  finish your profile — let's keep going."
`.trim();

export async function buildOnboardingSystemPrompt(args: {
  partialProfile: Record<string, unknown> | null;
  todayIso: string;
}): Promise<BuiltOnboardingPrompt> {
  const skills = await loadSkills();
  const gettingStarted = skills.skills.find((s) => s.name === "getting-started");

  const parts: string[] = [];
  parts.push(skills.claudeMd.trim());
  parts.push(ONBOARDING_BIAS);
  if (gettingStarted) {
    parts.push("## Skill: getting-started\n\n" + gettingStarted.body.trim());
  }
  parts.push(COMPLETION_INSTRUCTIONS);
  parts.push(`Today's date is ${args.todayIso}.`);

  const staticSystem = parts.join("\n\n");

  const dynamicSystem =
    args.partialProfile && Object.keys(args.partialProfile).length > 0
      ? [
          "## Existing partial profile",
          "The user has previously started onboarding. Pick up where they left off — don't re-ask things already captured. Use this as your working draft and merge new answers into it.",
          "```json",
          JSON.stringify(args.partialProfile, null, 2),
          "```",
        ].join("\n\n")
      : [
          "## Existing partial profile",
          "None — this is a fresh onboarding.",
        ].join("\n\n");

  return { staticSystem, dynamicSystem };
}

/**
 * Extract the first ```json ... ``` fenced block from a streamed assistant
 * message. Returns the parsed object or null if no valid JSON block is found.
 *
 * Tolerant to:
 *  - leading/trailing whitespace
 *  - language tag variants (\`json\`, \`JSON\`, \`json5\`, etc. — case-insensitive on json)
 *  - text before AND after the block
 */
export function extractProfileJson(text: string): Record<string, unknown> | null {
  // Match a fenced block starting with ```json (case-insensitive). Use a lazy
  // body match so we don't accidentally swallow a later closing fence.
  const fenceRe = /```\s*json\s*\n([\s\S]*?)\n\s*```/i;
  const m = fenceRe.exec(text);
  if (!m) return null;
  const raw = m[1].trim();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}
