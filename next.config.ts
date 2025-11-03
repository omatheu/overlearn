import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8")
);

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,

  // Tauri-specific configuration
  // Note: Tauri runs Next.js in server mode (not static export)
  // The dev server runs on localhost:3000 during development
  // Production builds are bundled with the Tauri binary

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};

export default nextConfig;