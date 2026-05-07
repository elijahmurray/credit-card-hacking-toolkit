import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    // Enable PPR / streaming once stable for our use case
  },
  // Skill assets are copied into web/.skills/ at build time by
  // scripts/copy-skills.mjs (run via the prebuild hook in package.json).
  // The skill loader reads from there. Keeping everything inside the
  // project root means Turbopack can trace it.
  outputFileTracingIncludes: {
    "/api/chat": [".skills/**/*"],
  },
};

export default config;
