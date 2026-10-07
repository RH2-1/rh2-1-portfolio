import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages serves the generated static site from `out`.
  // This project has no server-only routes or runtime data dependencies.
  output: "export",
};

export default nextConfig;
