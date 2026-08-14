import { getBadges } from "@/lib/history";

interface BadgesRowProps {
  streak: number;
}

export const BadgesRow = ({ streak }: BadgesRowProps) => {
  const badges = getBadges(streak);

  return (
    <div className="flex gap-2">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all duration-300 ${
            badge.unlocked
              ? "bg-sport-soft border-sport shadow-soft"
              : "bg-card border-border/60 opacity-60"
          }`}
        >
          <div className="text-xl leading-none">{badge.emoji}</div>
          <p
            className={`mt-1 text-[11px] font-extrabold ${
              badge.unlocked ? "text-sport" : "text-muted-foreground"
            }`}
          >
            {badge.label}
          </p>
        </div>
      ))}
    </div>
  );
};
