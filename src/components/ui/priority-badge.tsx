import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowUp, Minus, TrendingDown } from "lucide-react";

type Priority = "urgent" | "high" | "medium" | "low";

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
  className?: string;
}

const priorityConfig = {
  urgent: {
    label: "Urgente",
    icon: AlertCircle,
    className: "bg-[var(--color-priority-urgent-bg)] text-[var(--color-priority-urgent)] border-[var(--color-priority-urgent)]/20 hover:bg-[var(--color-priority-urgent)]/10",
  },
  high: {
    label: "Alta",
    icon: ArrowUp,
    className: "bg-[var(--color-priority-high-bg)] text-[var(--color-priority-high)] border-[var(--color-priority-high)]/20 hover:bg-[var(--color-priority-high)]/10",
  },
  medium: {
    label: "Média",
    icon: Minus,
    className: "bg-[var(--color-priority-medium-bg)] text-[var(--color-priority-medium)] border-[var(--color-priority-medium)]/20 hover:bg-[var(--color-priority-medium)]/10",
  },
  low: {
    label: "Baixa",
    icon: TrendingDown,
    className: "bg-[var(--color-priority-low-bg)] text-[var(--color-priority-low)] border-[var(--color-priority-low)]/20 hover:bg-[var(--color-priority-low)]/10",
  },
};

export function PriorityBadge({
  priority,
  showIcon = true,
  className,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

export function getPriorityColor(priority: Priority): string {
  return priorityConfig[priority].className;
}
