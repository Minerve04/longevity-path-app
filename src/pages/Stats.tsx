import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Flame, Target, TrendingUp, Pill } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

type Period = "week" | "month" | "year";

interface DayData {
  pushups: number;
  abs: number;
  supplements?: {
    codLiverOil: boolean;
    pumpkinOil: boolean;
    garlicCapsule: boolean;
    antioxidantTea: boolean;
  };
  customSupplements?: { id: string; name: string; checked: boolean }[];
}

interface SupplementStat {
  id: string;
  name: string;
  emoji: string;
  daysTaken: number;
  totalDays: number;
  percentage: number;
}

const defaultSupplements = [
  { id: "codLiverOil", name: "Huile de foie de morue", emoji: "🐟" },
  { id: "pumpkinOil", name: "Huile de courge", emoji: "🎃" },
  { id: "garlicCapsule", name: "Gélule d'ail", emoji: "🧄" },
  { id: "antioxidantTea", name: "Tisane antioxydante", emoji: "🍵" },
];

const Stats = () => {
  const [period, setPeriod] = useState<Period>("week");

  const getDateRange = (p: Period): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    const days = p === "week" ? 7 : p === "month" ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const getDayData = (date: Date): DayData | null => {
    const key = `longevity-${date.toISOString().split('T')[0]}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };

  const stats = useMemo(() => {
    const dates = getDateRange(period);
    let totalPushups = 0;
    let totalAbs = 0;
    let completedDays = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    // Supplements tracking
    const supplementCounts: Record<string, number> = {};
    const customSupplementCounts: Record<string, { name: string; count: number }> = {};

    dates.forEach((date, index) => {
      const dayData = getDayData(date);
      if (dayData) {
        totalPushups += dayData.pushups || 0;
        totalAbs += dayData.abs || 0;
        
        const hasActivity = (dayData.pushups || 0) > 0 || (dayData.abs || 0) > 0;
        if (hasActivity) {
          completedDays++;
          tempStreak++;
          if (index === dates.length - 1 || index === dates.length - 2) {
            currentStreak = Math.max(currentStreak, tempStreak);
          }
        } else {
          tempStreak = 0;
        }

        // Count supplements
        if (dayData.supplements) {
          defaultSupplements.forEach(supp => {
            if (dayData.supplements?.[supp.id as keyof typeof dayData.supplements]) {
              supplementCounts[supp.id] = (supplementCounts[supp.id] || 0) + 1;
            }
          });
        }

        // Count custom supplements
        if (dayData.customSupplements) {
          dayData.customSupplements.forEach(cs => {
            if (cs.checked) {
              if (!customSupplementCounts[cs.id]) {
                customSupplementCounts[cs.id] = { name: cs.name, count: 0 };
              }
              customSupplementCounts[cs.id].count++;
            }
          });
        }
      }
    });

    const totalDays = dates.length;

    // Build supplements stats
    const supplementsStats: SupplementStat[] = defaultSupplements.map(supp => ({
      id: supp.id,
      name: supp.name,
      emoji: supp.emoji,
      daysTaken: supplementCounts[supp.id] || 0,
      totalDays,
      percentage: Math.round(((supplementCounts[supp.id] || 0) / totalDays) * 100),
    }));

    // Add custom supplements
    Object.entries(customSupplementCounts).forEach(([id, data]) => {
      supplementsStats.push({
        id,
        name: data.name,
        emoji: "💊",
        daysTaken: data.count,
        totalDays,
        percentage: Math.round((data.count / totalDays) * 100),
      });
    });

    const avgSupplementRegularity = supplementsStats.length > 0
      ? Math.round(supplementsStats.reduce((acc, s) => acc + s.percentage, 0) / supplementsStats.length)
      : 0;

    return {
      totalPushups,
      totalAbs,
      streak: currentStreak,
      avgCompletion: Math.round((completedDays / totalDays) * 100),
      totalDays,
      supplementsStats,
      avgSupplementRegularity,
    };
  }, [period]);

  const chartData = useMemo(() => {
    const dates = getDateRange(period);
    
    if (period === "week") {
      const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
      return dates.map((date, i) => {
        const dayData = getDayData(date);
        return {
          name: dayLabels[date.getDay() === 0 ? 6 : date.getDay() - 1],
          pushups: dayData?.pushups || 0,
          abs: dayData?.abs || 0,
        };
      });
    } else if (period === "month") {
      const weeks: { pushups: number; abs: number }[] = [
        { pushups: 0, abs: 0 },
        { pushups: 0, abs: 0 },
        { pushups: 0, abs: 0 },
        { pushups: 0, abs: 0 },
        { pushups: 0, abs: 0 },
      ];
      dates.forEach((date, i) => {
        const weekIndex = Math.floor(i / 7);
        const dayData = getDayData(date);
        if (dayData && weekIndex < 5) {
          weeks[weekIndex].pushups += dayData.pushups || 0;
          weeks[weekIndex].abs += dayData.abs || 0;
        }
      });
      return weeks.slice(0, 4).map((w, i) => ({
        name: `Sem ${i + 1}`,
        pushups: w.pushups,
        abs: w.abs,
      }));
    } else {
      const months: { pushups: number; abs: number }[] = Array(12).fill(null).map(() => ({ pushups: 0, abs: 0 }));
      dates.forEach(date => {
        const monthIndex = date.getMonth();
        const dayData = getDayData(date);
        if (dayData) {
          months[monthIndex].pushups += dayData.pushups || 0;
          months[monthIndex].abs += dayData.abs || 0;
        }
      });
      const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      return months.map((m, i) => ({
        name: monthLabels[i],
        pushups: m.pushups,
        abs: m.abs,
      }));
    }
  }, [period]);

  const periodLabel = period === "week" ? "cette semaine" : period === "month" ? "ce mois" : "cette année";
  const goalMultiplier = period === "week" ? 1 : period === "month" ? 4 : 52;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-white">Statistiques</h1>
          <p className="text-slate-400 text-sm">Votre progression</p>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="week" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Semaine
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Mois
            </TabsTrigger>
            <TabsTrigger value="year" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Année
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.streak}</p>
            <p className="text-xs text-slate-400">Jours de série</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.avgCompletion}%</p>
            <p className="text-xs text-slate-400">Complétion</p>
          </div>
        </div>

        {/* Pushups Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">💪 Pompes</h3>
            <span className="text-emerald-400 text-sm">{periodLabel}</span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis hide />
                <Bar dataKey="pushups" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Objectif: {50 * goalMultiplier}</span>
            <span>Total: {stats.totalPushups}</span>
          </div>
        </div>

        {/* Abs Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">🔥 Abdos</h3>
            <span className="text-emerald-400 text-sm">{periodLabel}</span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis hide />
                <Bar dataKey="abs" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill="#f97316" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Objectif: {30 * goalMultiplier}</span>
            <span>Total: {stats.totalAbs}</span>
          </div>
        </div>

        {/* Supplements Tracking Table */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium">Suppléments</h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">{stats.avgSupplementRegularity}%</span>
            </div>
          </div>

          {stats.supplementsStats.length > 0 ? (
            <div className="space-y-3">
              {stats.supplementsStats.map((supp) => (
                <div key={supp.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      {supp.emoji} {supp.name}
                    </span>
                    <span className="text-slate-400">
                      {supp.daysTaken}/{supp.totalDays}
                      {supp.percentage === 100 && " ⭐"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(supp.percentage)}`}
                      style={{ width: `${supp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">
              Aucune donnée de suppléments pour {periodLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
