import { useState, useMemo } from "react";
import { TrendingUp, Activity, Target, Calendar } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Period = "week" | "month" | "year";

interface DayData {
  pushups: number;
  abs: number;
  footing: boolean;
  bikeComplete: boolean;
  supplements: Record<string, boolean>;
}

const Stats = () => {
  const [period, setPeriod] = useState<Period>("week");

  const getDateRange = (period: Period): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    const days = period === "week" ? 7 : period === "month" ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const getDayData = (date: Date): DayData | null => {
    const key = `longevity-${date.toDateString()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  };

  const stats = useMemo(() => {
    const dates = getDateRange(period);
    const dailyData = dates.map(date => ({
      date,
      data: getDayData(date)
    }));

    // Calculate totals
    let totalPushups = 0;
    let totalAbs = 0;
    let daysWithData = 0;
    let completedDays = 0;

    dailyData.forEach(({ data }) => {
      if (data) {
        daysWithData++;
        totalPushups += data.pushups || 0;
        totalAbs += data.abs || 0;
        
        // Check if day was "complete" (goals met)
        const pushupsComplete = (data.pushups || 0) >= 200;
        const absComplete = (data.abs || 0) >= 100;
        if (pushupsComplete && absComplete) {
          completedDays++;
        }
      }
    });

    // Calculate streak (consecutive days from today going back)
    let streak = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
      const { data } = dailyData[i];
      if (data && (data.pushups || 0) >= 200 && (data.abs || 0) >= 100) {
        streak++;
      } else if (i < dailyData.length - 1) {
        // Allow today to be incomplete, but break on past incomplete days
        break;
      }
    }

    // Average completion
    const avgCompletion = daysWithData > 0 ? Math.round((completedDays / daysWithData) * 100) : 0;

    // Aggregate data for charts based on period
    let chartData: { label: string; pushups: number; abs: number }[] = [];

    if (period === "week") {
      const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
      chartData = dailyData.map(({ date, data }) => ({
        label: dayLabels[date.getDay() === 0 ? 6 : date.getDay() - 1],
        pushups: data?.pushups || 0,
        abs: data?.abs || 0,
      }));
    } else if (period === "month") {
      // Aggregate by week (4-5 weeks)
      const weeks: { pushups: number; abs: number; count: number }[] = [];
      dailyData.forEach(({ data }, index) => {
        const weekIndex = Math.floor(index / 7);
        if (!weeks[weekIndex]) {
          weeks[weekIndex] = { pushups: 0, abs: 0, count: 0 };
        }
        weeks[weekIndex].pushups += data?.pushups || 0;
        weeks[weekIndex].abs += data?.abs || 0;
        weeks[weekIndex].count++;
      });
      chartData = weeks.map((week, i) => ({
        label: `Sem ${i + 1}`,
        pushups: week.pushups,
        abs: week.abs,
      }));
    } else {
      // Aggregate by month (12 months)
      const months: Map<string, { pushups: number; abs: number }> = new Map();
      const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
      
      dailyData.forEach(({ date, data }) => {
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const existing = months.get(monthKey) || { pushups: 0, abs: 0 };
        months.set(monthKey, {
          pushups: existing.pushups + (data?.pushups || 0),
          abs: existing.abs + (data?.abs || 0),
        });
      });

      // Get last 12 months in order
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const monthData = months.get(key) || { pushups: 0, abs: 0 };
        chartData.push({
          label: monthLabels[d.getMonth()],
          ...monthData,
        });
      }
    }

    // Calculate max values for chart scaling
    const maxPushups = Math.max(...chartData.map(d => d.pushups), 1);
    const maxAbs = Math.max(...chartData.map(d => d.abs), 1);

    // Goals based on period
    const pushupsGoal = period === "week" ? 200 : period === "month" ? 200 * 30 : 200 * 365;
    const absGoal = period === "week" ? 100 : period === "month" ? 100 * 30 : 100 * 365;

    return {
      chartData,
      maxPushups,
      maxAbs,
      totalPushups,
      totalAbs,
      streak,
      avgCompletion,
      pushupsGoal,
      absGoal,
    };
  }, [period]);

  const periodLabels = {
    week: "cette semaine",
    month: "ce mois",
    year: "cette année",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gradient-emerald">Statistiques</h1>
          <p className="text-xs text-muted-foreground">Votre progression {periodLabels[period]}</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="week" className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3 w-3" />
              Semaine
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3 w-3" />
              Mois
            </TabsTrigger>
            <TabsTrigger value="year" className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3 w-3" />
              Année
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Série actuelle</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">jours consécutifs</p>
          </div>

          <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Complétion</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.avgCompletion}%</p>
            <p className="text-xs text-muted-foreground">moyenne {periodLabels[period]}</p>
          </div>
        </div>

        {/* Push-ups Chart */}
        <section className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Pompes {periodLabels[period]}</h2>
          </div>
          <div className="flex items-end justify-between gap-1 h-32">
            {stats.chartData.map((item, i) => {
              const height = (item.pushups / stats.maxPushups) * 100;
              const isLast = i === stats.chartData.length - 1;
              const goalPerBar = period === "week" ? 200 : period === "month" ? 200 * 7 : stats.pushupsGoal / 12;
              const isComplete = item.pushups >= goalPerBar;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isComplete ? "bg-primary glow-emerald" : "bg-secondary"
                      } ${isLast && period === "week" ? "opacity-50" : ""}`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground truncate w-full text-center">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Objectif: {period === "week" ? "200/jour" : period === "month" ? "6000/mois" : "73K/an"}</span>
            <span className="text-primary">{stats.totalPushups.toLocaleString()} total</span>
          </div>
        </section>

        {/* Abs Chart */}
        <section className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Abdos {periodLabels[period]}</h2>
          </div>
          <div className="flex items-end justify-between gap-1 h-32">
            {stats.chartData.map((item, i) => {
              const height = (item.abs / stats.maxAbs) * 100;
              const isLast = i === stats.chartData.length - 1;
              const goalPerBar = period === "week" ? 100 : period === "month" ? 100 * 7 : stats.absGoal / 12;
              const isComplete = item.abs >= goalPerBar;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isComplete ? "bg-primary glow-emerald" : "bg-secondary"
                      } ${isLast && period === "week" ? "opacity-50" : ""}`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground truncate w-full text-center">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Objectif: {period === "week" ? "100/jour" : period === "month" ? "3000/mois" : "36K/an"}</span>
            <span className="text-primary">{stats.totalAbs.toLocaleString()} total</span>
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
