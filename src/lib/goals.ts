// Storage key
const GOALS_KEY = "hero-goals";

export interface Goals {
  pushups: number;
  abs: number;
  bikeDuration: number; // in minutes
}

export const DEFAULT_GOALS: Goals = {
  pushups: 200,
  abs: 100,
  bikeDuration: 20,
};

export const loadGoals = (): Goals => {
  try {
    const saved = localStorage.getItem(GOALS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        pushups: parsed.pushups ?? DEFAULT_GOALS.pushups,
        abs: parsed.abs ?? DEFAULT_GOALS.abs,
        bikeDuration: parsed.bikeDuration ?? DEFAULT_GOALS.bikeDuration,
      };
    }
  } catch {
    // Return defaults on error
  }
  return DEFAULT_GOALS;
};

export const saveGoals = (goals: Goals): void => {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};
