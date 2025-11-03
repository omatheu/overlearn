import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,

  // Tauri-specific configuration
  // Note: Tauri runs Next.js in server mode (not static export)
  // The dev server runs on localhost:3000 during development
  // Production builds are bundled with the Tauri binary
};

export default nextConfig;