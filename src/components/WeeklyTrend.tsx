import { TrendingUp } from "lucide-react";
import { getLastDays } from "@/lib/history";

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

export const WeeklyTrend = () => {
  const days = getLastDays(7);
  const average = Math.round(days.reduce((acc, d) => acc + d.progress, 0) / (days.length || 1));

  return (
    <div className="card-float p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-xl bg-supplement-soft flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-supplement" />
          </span>
          <h3 className="text-base font-extrabold text-foreground">7 derniers jours</h3>
        </div>
        <span className="text-xs font-bold text-primary bg-secondary rounded-full px-2.5 py-1">
          moy. {average}%
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 h-32">
        {days.map((day) => {
          const date = new Date(`${day.date}T00:00:00`);
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground">{day.progress}%</span>
              <div className="w-full flex-1 flex items-end">
                <div className="w-full h-full rounded-xl bg-secondary overflow-hidden flex items-end">
                  <div
                    className="w-full rounded-xl gradient-energy transition-all duration-700 ease-out"
                    style={{ height: `${Math.max(day.progress, 4)}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-muted-foreground">
                {DAY_LABELS[date.getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
