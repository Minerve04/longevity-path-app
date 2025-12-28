import { BarChart3, TrendingUp, Activity, Target } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const Stats = () => {
  // Demo stats data
  const weeklyStats = {
    pushups: [180, 200, 150, 200, 220, 200, 0],
    abs: [80, 100, 100, 90, 100, 100, 0],
    streak: 6,
    avgCompletion: 85,
  };

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gradient-emerald">Statistiques</h1>
          <p className="text-xs text-muted-foreground">Votre progression cette semaine</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Série actuelle</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{weeklyStats.streak}</p>
            <p className="text-xs text-muted-foreground">jours consécutifs</p>
          </div>

          <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Complétion</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{weeklyStats.avgCompletion}%</p>
            <p className="text-xs text-muted-foreground">moyenne semaine</p>
          </div>
        </div>

        {/* Push-ups Chart */}
        <section className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Pompes cette semaine</h2>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyStats.pushups.map((count, i) => {
              const height = (count / 220) * 100;
              const isToday = i === 6;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        count >= 200 ? "bg-primary glow-emerald" : "bg-secondary"
                      } ${isToday ? "opacity-50" : ""}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{days[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Objectif: 200/jour</span>
            <span className="text-primary">1150 total</span>
          </div>
        </section>

        {/* Abs Chart */}
        <section className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Abdos cette semaine</h2>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyStats.abs.map((count, i) => {
              const height = (count / 100) * 100;
              const isToday = i === 6;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        count >= 100 ? "bg-primary glow-emerald" : "bg-secondary"
                      } ${isToday ? "opacity-50" : ""}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{days[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Objectif: 100/jour</span>
            <span className="text-primary">570 total</span>
          </div>
        </section>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Les statistiques se mettent à jour automatiquement
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Stats;
