import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Dev compiles into .next-dev so that `npm run build` (which always writes its
// intermediate files to .next in export mode) can never break a running dev server.
// The static export itself lands in ./build.
const config = (phase: string): NextConfig => ({
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : "build",
});

export default config;
