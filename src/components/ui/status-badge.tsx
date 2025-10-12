import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Circle, Clock, CheckCircle2, XCircle } from "lucide-react";

type Status = "todo" | "doing" | "done" | "blocked";

interface StatusBadgeProps {
  status: Status;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  todo: {
    label: "A Fazer",
    icon: Circle,
    className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  },
  doing: {
    label: "Fazendo",
    icon: Clock,
    className: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
  },
  done: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
  },
  blocked: {
    label: "Bloqueado",
    icon: XCircle,
    className: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
  },
};

export function StatusBadge({
  status,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
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

export function getStatusColor(status: Status): string {
  return statusConfig[status].className;
}
