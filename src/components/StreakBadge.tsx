import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
}

export const StreakBadge = ({ streak }: StreakBadgeProps) => {
  if (streak <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
        <Flame className="h-3.5 w-3.5" />
        Aucune série
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sport-soft px-2.5 py-1 text-[11px] font-extrabold text-sport animate-scale-in">
      <Flame className="h-3.5 w-3.5" />
      {streak} jour{streak > 1 ? "s" : ""}
    </span>
  );
};
