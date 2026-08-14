import { CalendarDays } from "lucide-react";
import { getMonthDays, HistoryEntry, toDateKey } from "@/lib/history";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const levelClass = (entry: HistoryEntry) => {
  if (entry.progress >= 100) return "bg-success text-white";
  if (entry.progress >= 75) return "bg-success/70 text-white";
  if (entry.progress >= 50) return "bg-accent/70 text-white";
  if (entry.progress >= 25) return "bg-sport-soft text-sport";
  if (entry.progress > 0) return "bg-secondary text-muted-foreground";
  return "bg-secondary/60 text-muted-foreground/60";
};

export const MonthHeatmap = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = getMonthDays(year, month);
  const todayKey = toDateKey(today);

  // Décalage pour aligner sur lundi
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;

  const monthLabel = today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="card-float p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-8 w-8 rounded-xl bg-success-soft flex items-center justify-center">
          <CalendarDays className="h-4 w-4 text-success" />
        </span>
        <h3 className="text-base font-extrabold text-foreground capitalize">{monthLabel}</h3>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((entry) => {
          const dayNumber = parseInt(entry.date.split("-")[2], 10);
          return (
            <div
              key={entry.date}
              title={`${entry.date} — ${entry.progress}%${entry.validated ? " ✓" : ""}`}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${levelClass(
                entry
              )} ${entry.date === todayKey ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""} ${
                entry.validated ? "border border-success" : ""
              }`}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] font-semibold text-muted-foreground">
        <span>0%</span>
        <span className="h-3 w-3 rounded bg-secondary/60" />
        <span className="h-3 w-3 rounded bg-sport-soft" />
        <span className="h-3 w-3 rounded bg-accent/70" />
        <span className="h-3 w-3 rounded bg-success/70" />
        <span className="h-3 w-3 rounded bg-success" />
        <span>100%</span>
      </div>
    </div>
  );
};
