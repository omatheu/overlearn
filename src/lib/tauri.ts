/**
 * Tauri API Bindings
 *
 * This file provides TypeScript bindings to communicate with the Tauri Rust backend.
 * Only works when running in Tauri (desktop app), not in browser.
 */

// Check if we're running in Tauri
export const isTauri = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return "__TAURI__" in window;
};

// Lazy-load Tauri API (only available in Tauri context)
const getTauriCore = async () => {
  if (!isTauri()) {
    throw new Error("Tauri API is not available (not running in Tauri)");
  }
  return await import("@tauri-apps/api/core");
};

const getTauriNotification = async () => {
  if (!isTauri()) {
    throw new Error("Tauri API is not available (not running in Tauri)");
  }
  return await import("@tauri-apps/plugin-notification");
};

/**
 * Tauri Commands (invoke Rust functions)
 */
export const TauriCommands = {
  /**
   * Simple greeting command (for testing)
   */
  greet: async (name: string): Promise<string> => {
    const { invoke } = await getTauriCore();
    return await invoke<string>("greet", { name });
  },

  /**
   * Show a system notification
   */
  showNotification: async (title: string, body: string): Promise<void> => {
    const { invoke } = await getTauriCore();
    await invoke("show_notification", { title, body });
  },

  /**
   * Get application version
   */
  getAppVersion: async (): Promise<string> => {
    const { invoke } = await getTauriCore();
    return await invoke<string>("get_app_version");
  },

  /**
   * Open DevTools (debug mode only)
   */
  openDevTools: async (): Promise<void> => {
    const { invoke } = await getTauriCore();
    await invoke("open_dev_tools");
  },
};

/**
 * Native notification helper
 */
export const sendNativeNotification = async (
  title: string,
  body: string
): Promise<void> => {
  if (!isTauri()) {
    console.warn("Native notifications only available in Tauri");
    return;
  }

  try {
    const notification = await getTauriNotification();
    await notification.sendNotification({
      title,
      body,
    });
  } catch (error) {
    console.error("Failed to send native notification:", error);
  }
};

/**
 * Hook to check if running in Tauri
 */
export const useTauri = () => {
  return {
    isTauri: isTauri(),
    commands: TauriCommands,
    sendNotification: sendNativeNotification,
  };
};

/**
 * Platform detection
 */
export const getPlatform = async (): Promise<string> => {
  if (!isTauri()) {
    return "web";
  }

  try {
    const core = await getTauriCore();
    // @ts-ignore - type may not be available
    return await core.invoke<string>("plugin:os|platform");
  } catch {
    return "unknown";
  }
};
