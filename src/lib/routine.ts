// « Routine type » : configuration habituelle réutilisable jour après jour
import { Goals, loadGoals, saveGoals } from "@/lib/goals";

export interface RoutineItem {
  id: string;
  label: string;
}

export interface Routine {
  savedAt: string;
  goals: Goals;
  exercises: RoutineItem[];
  supplements: RoutineItem[];
  cureTasks: RoutineItem[];
  activeCure: string | null;
}

const ROUTINE_KEY = "hero-routine";
const CUSTOM_EXERCISES_KEY = "hero-custom-exercises";
const CUSTOM_SUPPLEMENTS_KEY = "hero-custom-supplements";

const dailyKey = (date: Date = new Date()) =>
  `longevity-${date.toISOString().split("T")[0]}`;

const readList = (key: string): RoutineItem[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readDay = (): Record<string, unknown> => {
  try {
    const raw = localStorage.getItem(dailyKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const loadRoutine = (): Routine | null => {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    return raw ? (JSON.parse(raw) as Routine) : null;
  } catch {
    return null;
  }
};

/** Enregistre la configuration actuelle comme routine type. */
export const saveRoutineFromToday = (): Routine => {
  const day = readDay();
  const routine: Routine = {
    savedAt: new Date().toISOString(),
    goals: loadGoals(),
    exercises: readList(CUSTOM_EXERCISES_KEY),
    supplements: readList(CUSTOM_SUPPLEMENTS_KEY),
    cureTasks: (day.cureTasks as RoutineItem[]) ?? [],
    activeCure: (day.activeCure as string | null) ?? null,
  };
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
  return routine;
};

/** Réinitialise la journée à partir de la routine type. */
export const applyRoutine = (): boolean => {
  const routine = loadRoutine();
  if (!routine) return false;

  saveGoals(routine.goals);
  localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(routine.exercises));
  localStorage.setItem(CUSTOM_SUPPLEMENTS_KEY, JSON.stringify(routine.supplements));

  const freshDay = {
    pushups: 0,
    abs: 0,
    squats: 0,
    footing: false,
    bikeComplete: false,
    supplements: {
      codLiverOil: false,
      pumpkinOil: false,
      garlicCapsule: false,
      antioxidantTea: false,
    },
    customExercises: routine.exercises.map((e) => ({ ...e, checked: false })),
    customSupplements: routine.supplements.map((s) => ({ ...s, checked: false })),
    activeCure: routine.activeCure,
    cureTasks: routine.cureTasks,
    cureChecked: {},
  };
  localStorage.setItem(dailyKey(), JSON.stringify(freshDay));
  return true;
};

export const clearRoutine = (): void => {
  localStorage.removeItem(ROUTINE_KEY);
};
