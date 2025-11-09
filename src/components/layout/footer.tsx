import { AppVersion } from "@/components/ui/app-version";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex h-14 items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          OverLearn - Productivity & Learning Management
        </p>
        <AppVersion />
      </div>
    </footer>
  );
}
