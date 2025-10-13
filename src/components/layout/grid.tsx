import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: number;
  className?: string;
}

/**
 * Sistema de grid responsivo baseado em Tailwind
 *
 * @example
 * ```tsx
 * <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * ```
 */
export function Grid({
  children,
  cols = { default: 1 },
  gap = 6,
  className,
}: GridProps) {
  const gridClasses = cn(
    "grid",
    cols.default === 1 && "grid-cols-1",
    cols.default === 2 && "grid-cols-2",
    cols.default === 3 && "grid-cols-3",
    cols.default === 4 && "grid-cols-4",
    cols.sm && cols.sm === 1 && "sm:grid-cols-1",
    cols.sm && cols.sm === 2 && "sm:grid-cols-2",
    cols.sm && cols.sm === 3 && "sm:grid-cols-3",
    cols.sm && cols.sm === 4 && "sm:grid-cols-4",
    cols.md && cols.md === 1 && "md:grid-cols-1",
    cols.md && cols.md === 2 && "md:grid-cols-2",
    cols.md && cols.md === 3 && "md:grid-cols-3",
    cols.md && cols.md === 4 && "md:grid-cols-4",
    cols.lg && cols.lg === 1 && "lg:grid-cols-1",
    cols.lg && cols.lg === 2 && "lg:grid-cols-2",
    cols.lg && cols.lg === 3 && "lg:grid-cols-3",
    cols.lg && cols.lg === 4 && "lg:grid-cols-4",
    cols.xl && cols.xl === 1 && "xl:grid-cols-1",
    cols.xl && cols.xl === 2 && "xl:grid-cols-2",
    cols.xl && cols.xl === 3 && "xl:grid-cols-3",
    cols.xl && cols.xl === 4 && "xl:grid-cols-4",
    cols["2xl"] && cols["2xl"] === 1 && "2xl:grid-cols-1",
    cols["2xl"] && cols["2xl"] === 2 && "2xl:grid-cols-2",
    cols["2xl"] && cols["2xl"] === 3 && "2xl:grid-cols-3",
    cols["2xl"] && cols["2xl"] === 4 && "2xl:grid-cols-4",
    gap === 2 && "gap-2",
    gap === 3 && "gap-3",
    gap === 4 && "gap-4",
    gap === 6 && "gap-6",
    gap === 8 && "gap-8",
    gap === 10 && "gap-10",
    gap === 12 && "gap-12",
    className
  );

  return <div className={gridClasses}>{children}</div>;
}

interface StackProps {
  children: ReactNode;
  direction?: "vertical" | "horizontal";
  spacing?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  className?: string;
}

/**
 * Stack component para layout flexbox
 */
export function Stack({
  children,
  direction = "vertical",
  spacing = 4,
  align = "stretch",
  justify = "start",
  className,
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        spacing === 1 && (direction === "vertical" ? "space-y-1" : "space-x-1"),
        spacing === 2 && (direction === "vertical" ? "space-y-2" : "space-x-2"),
        spacing === 3 && (direction === "vertical" ? "space-y-3" : "space-x-3"),
        spacing === 4 && (direction === "vertical" ? "space-y-4" : "space-x-4"),
        spacing === 6 && (direction === "vertical" ? "space-y-6" : "space-x-6"),
        spacing === 8 && (direction === "vertical" ? "space-y-8" : "space-x-8"),
        align === "start" && "items-start",
        align === "center" && "items-center",
        align === "end" && "items-end",
        align === "stretch" && "items-stretch",
        justify === "start" && "justify-start",
        justify === "center" && "justify-center",
        justify === "end" && "justify-end",
        justify === "between" && "justify-between",
        justify === "around" && "justify-around",
        className
      )}
    >
      {children}
    </div>
  );
}
