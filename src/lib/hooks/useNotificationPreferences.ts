import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Notification Preferences Type
 */
export interface NotificationPreferences {
  id: string;
  userId: number;

  // Event toggles
  pomodoroEnabled: boolean;
  studyGoalEnabled: boolean;
  taskDeadlineEnabled: boolean;

  // Delivery methods
  systemNotifications: boolean;
  emailNotifications: boolean;

  // Email config
  email: string | null;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;  // "22:00"
  quietHoursEnd: string | null;    // "08:00"

  createdAt: string;
  updatedAt: string;
}

/**
 * Hook to manage notification preferences
 */
export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  // Fetch preferences
  const { data: preferences, isLoading, error } = useQuery<NotificationPreferences>({
    queryKey: ["notificationPreferences"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      return res.json();
    },
  });

  // Update preferences
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["notificationPreferences"], data);
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
