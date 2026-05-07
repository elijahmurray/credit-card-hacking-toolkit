import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * Server-only Anthropic provider factory. Reads ANTHROPIC_API_KEY at call time
 * so we don't accidentally bake the key into the client bundle.
 *
 * Use:
 *   import { anthropic } from "@/lib/ai/anthropic";
 *   const model = anthropic()("claude-sonnet-4-6");
 */
let cached: ReturnType<typeof createAnthropic> | null = null;

export function anthropic() {
  if (!cached) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    cached = createAnthropic({ apiKey });
  }
  return cached;
}
