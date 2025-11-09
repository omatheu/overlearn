"use client";

import { useState } from "react";
import { useTauri } from "@/lib/tauri";

/**
 * Test page for native notifications
 * Only works in Tauri (desktop app)
 */
export default function TestNotificationsPage() {
  const { isTauri, commands } = useTauri();
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testNotification = async (
    type: string,
    action: () => Promise<void>
  ) => {
    setLoading(true);
    setResult(`Testing ${type}...`);
    try {
      await action();
      setResult(`✅ ${type} sent successfully!`);
    } catch (error) {
      setResult(`❌ ${type} failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isTauri) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4">
          <h2 className="text-lg font-semibold text-yellow-800">
            ⚠️ Not running in Tauri
          </h2>
          <p className="mt-2 text-yellow-700">
            This page only works in the native desktop app. Please run:
          </p>
          <code className="mt-2 block rounded bg-yellow-100 p-2 text-sm">
            npm run tauri:dev
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">🔔 Test Native Notifications</h1>
        <p className="mt-2 text-muted-foreground">
          Test all notification types in the desktop app
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Notification */}
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Basic Notification</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Simple notification using Tauri plugin
          </p>
          <button
            onClick={() =>
              testNotification("Basic notification", async () => {
                await commands.showNotification(
                  "Test Notification",
                  "This is a test from OverLearn!"
                );
              })
            }
            disabled={loading}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Test Basic
          </button>
        </div>

        {/* Native Notification - Normal */}
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Native Notification (Normal)</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Linux libnotify notification with normal urgency
          </p>
          <button
            onClick={() =>
              testNotification("Native notification", async () => {
                await commands.showNativeNotification(
                  "📢 Native Notification",
                  "This uses Linux D-Bus libnotify!",
                  "normal"
                );
              })
            }
            disabled={loading}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Test Native (Normal)
          </button>
        </div>

        {/* Native Notification - Critical */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="text-lg font-semibold text-red-800">
            Native Notification (Critical)
          </h3>
          <p className="mt-1 text-sm text-red-600">
            Critical urgency notification - stays longer
          </p>
          <button
            onClick={() =>
              testNotification("Critical notification", async () => {
                await commands.showNativeNotification(
                  "🚨 Critical Alert",
                  "This is a critical notification!",
                  "critical"
                );
              })
            }
            disabled={loading}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            Test Critical
          </button>
        </div>

        {/* Pomodoro Work Complete */}
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Pomodoro - Work Complete</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulate work session completion (25 min)
          </p>
          <button
            onClick={() =>
              testNotification("Pomodoro work notification", async () => {
                await commands.notifyPomodoroComplete(
                  "work",
                  25,
                  "Implement notifications"
                );
              })
            }
            disabled={loading}
            className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            Test Pomodoro Work
          </button>
        </div>

        {/* Pomodoro Break Complete */}
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Pomodoro - Break Complete</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulate break completion (5 min)
          </p>
          <button
            onClick={() =>
              testNotification("Pomodoro break notification", async () => {
                await commands.notifyPomodoroComplete("break", 5);
              })
            }
            disabled={loading}
            className="mt-4 rounded-md bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
          >
            Test Pomodoro Break
          </button>
        </div>

        {/* Study Goal Milestones */}
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Study Goal Milestones</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Test different milestone notifications
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[25, 50, 75, 100].map((milestone) => (
              <button
                key={milestone}
                onClick={() =>
                  testNotification(
                    `${milestone}% milestone notification`,
                    async () => {
                      await commands.notifyStudyGoalMilestone(
                        "Learn Tauri & Rust",
                        milestone
                      );
                    }
                  )
                }
                disabled={loading}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {milestone}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mt-8 rounded-lg border bg-muted p-4">
          <pre className="text-sm">{result}</pre>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-800">💡 Testing Tips</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700">
          <li>Check your system notification area (top right on most Linux DEs)</li>
          <li>Native notifications appear as system notifications</li>
          <li>Critical notifications stay longer on screen</li>
          <li>Each notification type has custom icons and messages</li>
        </ul>
      </div>
    </div>
  );
}
