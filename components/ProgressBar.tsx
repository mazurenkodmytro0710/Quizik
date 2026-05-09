import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  color?: "primary" | "green" | "yellow";
}

export function ProgressBar({ value, className, color = "primary" }: ProgressBarProps) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-white/10", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          color === "primary" && "bg-violet-500",
          color === "green" && "bg-emerald-500",
          color === "yellow" && "bg-amber-400"
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
