import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Flame, Target, TrendingUp, Pill, Dumbbell, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/BottomNav";

type Period = "week" | "month" | "year";

interface DayData {
  pushups: number;
  abs: number;
  footing?: boolean;
  bikeComplete?: boolean;
  customExercises?: { id: string; label: string; checked: boolean }[];
  supplements?: {
    codLiverOil: boolean;
    pumpkinOil: boolean;
    garlicCapsule: boolean;
    antioxidantTea: boolean;
  };
  customSupplements?: { id: string; label: string; checked: boolean }[];
  activeCure?: string | null;
  cureTasks?: { id: string; label: string }[];
  cureChecked?: { [id: string]: boolean };
}

interface CureTaskStat {
  id: string;
  name: string;
  daysDone: number;
  totalDays: number;
  percentage: number;
}

interface ExerciseStat {
  id: string;
  name: string;
  emoji: string;
  daysDone: number;
  totalDays: number;
  percentage: number;
}

interface SupplementStat {
  id: string;
  name: string;
  emoji: string;
  daysTaken: number;
  totalDays: number;
  percentage: number;
}

const defaultExercises = [
  { id: "footing", name: "Footing", emoji: "🏃" },
  { id: "bike", name: "Vélo", emoji: "🚴" },
];

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

    // Exercise tracking
    const exerciseCounts: Record<string, number> = {};
    const customExerciseCounts: Record<string, { name: string; count: number }> = {};

    // Supplements tracking
    const supplementCounts: Record<string, number> = {};
    const customSupplementCounts: Record<string, { name: string; count: number }> = {};

    // Cure tracking
    const cureTaskCounts: Record<string, { name: string; count: number; totalDays: number }> = {};
    let cureDaysActive = 0;
    let cureDaysCompleted = 0;

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

        // Count default exercises
        if (dayData.footing) {
          exerciseCounts["footing"] = (exerciseCounts["footing"] || 0) + 1;
        }
        if (dayData.bikeComplete) {
          exerciseCounts["bike"] = (exerciseCounts["bike"] || 0) + 1;
        }

        // Count custom exercises
        if (dayData.customExercises) {
          dayData.customExercises.forEach(ex => {
            if (ex.checked) {
              if (!customExerciseCounts[ex.id]) {
                customExerciseCounts[ex.id] = { name: ex.label, count: 0 };
              }
              customExerciseCounts[ex.id].count++;
            } else if (!customExerciseCounts[ex.id]) {
              // Track the exercise even if not checked (to show it exists)
              customExerciseCounts[ex.id] = { name: ex.label, count: 0 };
            }
          });
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
                customSupplementCounts[cs.id] = { name: cs.label, count: 0 };
              }
              customSupplementCounts[cs.id].count++;
            } else if (!customSupplementCounts[cs.id]) {
              // Track the supplement even if not checked
              customSupplementCounts[cs.id] = { name: cs.label, count: 0 };
            }
          });
        }

        // Count cure tasks
        if (dayData.activeCure && dayData.cureTasks && dayData.cureTasks.length > 0) {
          cureDaysActive++;
          let allTasksDone = true;
          
          dayData.cureTasks.forEach(task => {
            const taskKey = `${dayData.activeCure}-${task.label}`;
            if (!cureTaskCounts[taskKey]) {
              cureTaskCounts[taskKey] = { name: task.label, count: 0, totalDays: 0 };
            }
            cureTaskCounts[taskKey].totalDays++;
            
            if (dayData.cureChecked?.[task.id]) {
              cureTaskCounts[taskKey].count++;
            } else {
              allTasksDone = false;
            }
          });
          
          if (allTasksDone && dayData.cureTasks.length > 0) {
            cureDaysCompleted++;
          }
        }
      }
    });

    const totalDays = dates.length;

    // Build exercise stats
    const exercisesStats: ExerciseStat[] = defaultExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      emoji: ex.emoji,
      daysDone: exerciseCounts[ex.id] || 0,
      totalDays,
      percentage: Math.round(((exerciseCounts[ex.id] || 0) / totalDays) * 100),
    }));

    // Add custom exercises
    Object.entries(customExerciseCounts).forEach(([id, data]) => {
      exercisesStats.push({
        id,
        name: data.name,
        emoji: "🏋️",
        daysDone: data.count,
        totalDays,
        percentage: Math.round((data.count / totalDays) * 100),
      });
    });

    const avgExerciseRegularity = exercisesStats.length > 0
      ? Math.round(exercisesStats.reduce((acc, e) => acc + e.percentage, 0) / exercisesStats.length)
      : 0;

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

    // Build cure stats
    const cureTasksStats: CureTaskStat[] = Object.entries(cureTaskCounts).map(([id, data]) => ({
      id,
      name: data.name,
      daysDone: data.count,
      totalDays: data.totalDays,
      percentage: data.totalDays > 0 ? Math.round((data.count / data.totalDays) * 100) : 0,
    }));

    const avgCureRegularity = cureTasksStats.length > 0
      ? Math.round(cureTasksStats.reduce((acc, c) => acc + c.percentage, 0) / cureTasksStats.length)
      : 0;

    return {
      totalPushups,
      totalAbs,
      streak: currentStreak,
      avgCompletion: Math.round((completedDays / totalDays) * 100),
      totalDays,
      exercisesStats,
      avgExerciseRegularity,
      supplementsStats,
      avgSupplementRegularity,
      cureTasksStats,
      avgCureRegularity,
      cureDaysActive,
      cureDaysCompleted,
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

        {/* Exercises Tracking Table */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-medium">Exercices</h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">{stats.avgExerciseRegularity}%</span>
            </div>
          </div>

          {stats.exercisesStats.length > 0 ? (
            <div className="space-y-3">
              {stats.exercisesStats.map((ex) => (
                <div key={ex.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      {ex.emoji} {ex.name}
                    </span>
                    <span className="text-slate-400">
                      {ex.daysDone}/{ex.totalDays}
                      {ex.percentage === 100 && " ⭐"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(ex.percentage)}`}
                      style={{ width: `${ex.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">
              Aucune donnée d'exercices pour {periodLabel}
            </p>
          )}
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

        {/* Cure Tracking Section */}
        {stats.cureTasksStats.length > 0 && (
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-medium">Cures</h3>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">{stats.avgCureRegularity}%</span>
              </div>
            </div>

            <div className="flex gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Jours actifs:</span>
                <span className="text-white font-medium">{stats.cureDaysActive}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Jours 100%:</span>
                <span className="text-emerald-400 font-medium">{stats.cureDaysCompleted}</span>
              </div>
            </div>

            <div className="space-y-3">
              {stats.cureTasksStats.map((task) => (
                <div key={task.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      ✨ {task.name}
                    </span>
                    <span className="text-slate-400">
                      {task.daysDone}/{task.totalDays}
                      {task.percentage === 100 && " ⭐"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(task.percentage)}`}
                      style={{ width: `${task.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Stats;
