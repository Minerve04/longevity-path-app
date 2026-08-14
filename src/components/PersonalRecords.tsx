import { Trophy, Flame, CheckCircle2 } from "lucide-react";
import { getBestStreak, getCurrentStreak, getTotalValidatedDays, STREAK_THRESHOLD } from "@/lib/history";
import { BadgesRow } from "@/components/BadgesRow";

export const PersonalRecords = () => {
  const currentStreak = getCurrentStreak();
  const bestStreak = getBestStreak();
  const totalValidated = getTotalValidatedDays();

  return (
    <div className="card-float p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-xl bg-sport-soft flex items-center justify-center">
          <Trophy className="h-4 w-4 text-sport" />
        </span>
        <h3 className="text-base font-extrabold text-foreground">Records personnels</h3>
      </div>

      <p className="text-[11px] font-semibold text-muted-foreground">
        Une journée compte dans la série dès {STREAK_THRESHOLD} % d'accomplissement.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-secondary p-3 text-center">
          <Flame className="h-5 w-5 text-sport mx-auto mb-1" />
          <p className="text-xl font-extrabold text-foreground">{currentStreak}</p>
          <p className="text-[10px] font-semibold text-muted-foreground">Série en cours</p>
        </div>
        <div className="rounded-2xl bg-secondary p-3 text-center">
          <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
          <p className="text-xl font-extrabold text-foreground">{bestStreak}</p>
          <p className="text-[10px] font-semibold text-muted-foreground">Meilleure série</p>
        </div>
        <div className="rounded-2xl bg-secondary p-3 text-center">
          <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
          <p className="text-xl font-extrabold text-foreground">{totalValidated}</p>
          <p className="text-[10px] font-semibold text-muted-foreground">Journées validées</p>
        </div>
      </div>


      <BadgesRow streak={Math.max(currentStreak, bestStreak)} />
    </div>
  );
};
