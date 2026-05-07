import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    // Enable PPR / streaming once stable for our use case
  },
  // We load skill markdown from the parent plugin/ dir at build time.
  // See lib/ai/load-skills.ts for the loader.
  outputFileTracingIncludes: {
    "/api/chat": ["../data/**/*", "../plugins/credit-card-hacker/skills/**/*", "../CLAUDE.md"],
  },
};

export default config;
