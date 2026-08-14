// Historique quotidien : % global, actions faites/total, validation
const HISTORY_KEY = "hero-history";

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  progress: number; // 0-100
  done: number;
  total: number;
  validated: boolean;
}

export type History = Record<string, HistoryEntry>;

export const toDateKey = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

export const loadHistory = (): History => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as History) : {};
  } catch {
    return {};
  }
};

export const saveHistory = (history: History): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getEntry = (date: Date | string): HistoryEntry | null => {
  const key = typeof date === "string" ? date : toDateKey(date);
  return loadHistory()[key] ?? null;
};

/** Enregistre (ou met à jour) l'entrée d'une journée. */
export const saveDayEntry = (
  entry: Omit<HistoryEntry, "date"> & { date?: string }
): HistoryEntry => {
  const history = loadHistory();
  const date = entry.date ?? toDateKey();
  const previous = history[date];
  const next: HistoryEntry = {
    date,
    progress: entry.progress,
    done: entry.done,
    total: entry.total,
    validated: entry.validated || previous?.validated || false,
  };
  history[date] = next;
  saveHistory(history);
  return next;
};

const shiftDay = (date: Date, delta: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
};

/** Jours consécutifs validés (aujourd'hui ou hier comme point de départ). */
export const getCurrentStreak = (history: History = loadHistory()): number => {
  let streak = 0;
  let cursor = new Date();
  if (!history[toDateKey(cursor)]?.validated) {
    cursor = shiftDay(cursor, -1);
    if (!history[toDateKey(cursor)]?.validated) return 0;
  }
  while (history[toDateKey(cursor)]?.validated) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
};

/** Meilleure série jamais réalisée. */
export const getBestStreak = (history: History = loadHistory()): number => {
  const dates = Object.values(history)
    .filter((e) => e.validated)
    .map((e) => e.date)
    .sort();
  let best = 0;
  let current = 0;
  let previous: string | null = null;
  dates.forEach((date) => {
    if (previous) {
      const expected = toDateKey(shiftDay(new Date(`${previous}T00:00:00`), 1));
      current = expected === date ? current + 1 : 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
    previous = date;
  });
  return best;
};

export const getTotalValidatedDays = (history: History = loadHistory()): number =>
  Object.values(history).filter((e) => e.validated).length;

/** Les N derniers jours (du plus ancien au plus récent). */
export const getLastDays = (
  count = 7,
  history: History = loadHistory()
): HistoryEntry[] => {
  const days: HistoryEntry[] = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = toDateKey(shiftDay(today, -i));
    days.push(history[date] ?? { date, progress: 0, done: 0, total: 0, validated: false });
  }
  return days;
};

/** Toutes les journées d'un mois donné (grille calendrier). */
export const getMonthDays = (
  year: number,
  month: number, // 0-11
  history: History = loadHistory()
): HistoryEntry[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: HistoryEntry[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = toDateKey(new Date(year, month, day));
    days.push(history[date] ?? { date, progress: 0, done: 0, total: 0, validated: false });
  }
  return days;
};

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  threshold: number;
  unlocked: boolean;
}

export const BADGE_THRESHOLDS = [3, 7, 30];

export const getBadges = (streak: number): Badge[] => [
  { id: "streak-3", label: "3 jours", emoji: "🌱", threshold: 3, unlocked: streak >= 3 },
  { id: "streak-7", label: "7 jours", emoji: "⚡", threshold: 7, unlocked: streak >= 7 },
  { id: "streak-30", label: "30 jours", emoji: "🏆", threshold: 30, unlocked: streak >= 30 },
];
