"use client";

import { useEffect, useState } from "react";
import { useTauri } from "@/lib/tauri";

/**
 * App Version Display Component
 * Shows the current version of the application
 * - Web version: from package.json
 * - Native version: from Tauri (Cargo.toml)
 */
export function AppVersion() {
  const { isTauri, commands } = useTauri();
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getVersion = async () => {
      try {
        if (isTauri) {
          // Get version from Tauri (Rust)
          const tauriVersion = await commands.getAppVersion();
          setVersion(tauriVersion);
        } else {
          // Get version from package.json (Web)
          setVersion(process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0");
        }
      } catch (error) {
        console.error("Failed to get app version:", error);
        setVersion("unknown");
      } finally {
        setLoading(false);
      }
    };

    getVersion();
  }, [isTauri, commands]);

  if (loading) {
    return (
      <div className="text-xs text-muted-foreground">
        Loading version...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium">
        {isTauri ? "🦀 Native" : "🌐 Web"}
      </span>
      <span>v{version}</span>
    </div>
  );
}
