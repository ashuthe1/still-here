import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Production builds use the standard layout (compile into .next, export into ./out),
// which is what Vercel's Next.js preset expects. The dev server compiles into
// .next-dev so that running a build never breaks a running dev server.
const config = (phase: string): NextConfig => ({
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(phase === PHASE_DEVELOPMENT_SERVER ? { distDir: ".next-dev" } : {}),
});

export default config;
