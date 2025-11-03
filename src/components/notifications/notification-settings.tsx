"use client";

import { useState, useEffect } from "react";
import { useNotificationPreferences } from "@/lib/hooks/useNotificationPreferences";
import { useTauri } from "@/lib/tauri";
import { Label } from "@/components/ui/label";

/**
 * Notification Settings Component
 * Allows users to configure notification preferences
 */
export function NotificationSettings() {
  const { preferences, isLoading, updatePreferences, isUpdating } =
    useNotificationPreferences();
  const { isTauri } = useTauri();

  // Local state for form inputs
  const [email, setEmail] = useState("");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");

  // Initialize form from preferences
  useEffect(() => {
    if (preferences) {
      setEmail(preferences.email || "");
      setQuietStart(preferences.quietHoursStart || "22:00");
      setQuietEnd(preferences.quietHoursEnd || "08:00");
    }
  }, [preferences]);

  if (isLoading) {
    return (
      <div className="rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 rounded bg-muted"></div>
          <div className="h-10 rounded bg-muted"></div>
          <div className="h-10 rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Failed to load notification preferences</p>
      </div>
    );
  }

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleEmailSave = () => {
    updatePreferences({ email });
  };

  const handleQuietHoursSave = () => {
    updatePreferences({
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform Info */}
      {isTauri && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦀</span>
            <div>
              <p className="font-semibold text-blue-800">Running in Tauri</p>
              <p className="text-sm text-blue-600">
                Native system notifications are available!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Event Types */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Notification Events</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which events trigger notifications
        </p>

        <div className="mt-4 space-y-4">
          {/* Pomodoro */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">🎯 Pomodoro Timer</Label>
              <p className="text-sm text-muted-foreground">
                Notify when work sessions and breaks complete
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.pomodoroEnabled}
              onChange={(e) =>
                handleToggle("pomodoroEnabled", e.target.checked)
              }
              disabled={isUpdating}
              className="h-5 w-5 cursor-pointer rounded border-gray-300"
            />
          </div>

          {/* Study Goals */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">📚 Study Goals</Label>
              <p className="text-sm text-muted-foreground">
                Notify at milestones (25%, 50%, 75%, 100%) and deadlines
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.studyGoalEnabled}
              onChange={(e) =>
                handleToggle("studyGoalEnabled", e.target.checked)
              }
              disabled={isUpdating}
              className="h-5 w-5 cursor-pointer rounded border-gray-300"
            />
          </div>

          {/* Task Deadlines */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">📅 Task Deadlines</Label>
              <p className="text-sm text-muted-foreground">
                Notify when tasks are due soon or overdue
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.taskDeadlineEnabled}
              onChange={(e) =>
                handleToggle("taskDeadlineEnabled", e.target.checked)
              }
              disabled={isUpdating}
              className="h-5 w-5 cursor-pointer rounded border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Delivery Methods */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Delivery Methods</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how you want to receive notifications
        </p>

        <div className="mt-4 space-y-4">
          {/* System Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">
                🔔 System Notifications
                {isTauri && (
                  <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Available
                  </span>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isTauri
                  ? "Native Linux notifications via D-Bus"
                  : "Only available in desktop app"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.systemNotifications}
              onChange={(e) =>
                handleToggle("systemNotifications", e.target.checked)
              }
              disabled={isUpdating || !isTauri}
              className="h-5 w-5 cursor-pointer rounded border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">📧 Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) =>
                handleToggle("emailNotifications", e.target.checked)
              }
              disabled={isUpdating}
              className="h-5 w-5 cursor-pointer rounded border-gray-300"
            />
          </div>
        </div>

        {/* Email Configuration */}
        {preferences.emailNotifications && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Label htmlFor="email" className="font-medium">
              Email Address
            </Label>
            <div className="mt-2 flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleEmailSave}
                disabled={isUpdating || !email}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {preferences.email && (
              <p className="mt-2 text-xs text-muted-foreground">
                Current: {preferences.email}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">🌙 Quiet Hours</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Disable notifications during specific hours
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.quietHoursEnabled}
            onChange={(e) =>
              handleToggle("quietHoursEnabled", e.target.checked)
            }
            disabled={isUpdating}
            className="h-5 w-5 cursor-pointer rounded border-gray-300"
          />
        </div>

        {preferences.quietHoursEnabled && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-start" className="font-medium">
                  Start Time
                </Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="quiet-end" className="font-medium">
                  End Time
                </Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <button
              onClick={handleQuietHoursSave}
              disabled={isUpdating}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save Quiet Hours
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Current: {preferences.quietHoursStart} - {preferences.quietHoursEnd}
            </p>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {isUpdating && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">Saving preferences...</p>
        </div>
      )}
    </div>
  );
}
