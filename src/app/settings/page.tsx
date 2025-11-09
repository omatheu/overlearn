import { NotificationSettings } from "@/components/notifications/notification-settings";

/**
 * Settings Page
 * Main settings page with notification preferences
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">⚙️ Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your OverLearn preferences
        </p>
      </div>

      <div className="grid gap-8">
        {/* Notification Settings Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">🔔 Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Configure when and how you receive notifications
            </p>
          </div>
          <NotificationSettings />
        </section>

        {/* Future sections can be added here */}
        {/*
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">🎨 Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Customize the look and feel
            </p>
          </div>
        </section>
        */}
      </div>
    </div>
  );
}
