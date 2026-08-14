// Gestion centralisée des rappels (persistance localStorage + fallback in-app)

export interface Reminder {
  id: string;
  title: string;
  time: string; // "HH:mm"
  enabled: boolean;
}

export const REMINDERS_KEY = "longevity-reminders";
export const REMINDERS_ENABLED_KEY = "hero-reminders-enabled";
const FIRED_KEY = "hero-reminders-fired";

export const DEFAULT_REMINDERS: Reminder[] = [
  { id: "1", title: "Suppléments du matin", time: "08:00", enabled: true },
  { id: "2", title: "Session sport", time: "09:00", enabled: true },
  { id: "3", title: "Tisane antioxydante", time: "20:00", enabled: true },
];

export const loadReminders = (): Reminder[] => {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Reminder[];
    }
  } catch {
    // valeurs par défaut
  }
  return DEFAULT_REMINDERS;
};

export const saveReminders = (reminders: Reminder[]): void => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  window.dispatchEvent(new Event("hero-reminders-changed"));
};

export const areRemindersEnabled = (): boolean =>
  localStorage.getItem(REMINDERS_ENABLED_KEY) !== "false";

export const setRemindersEnabled = (enabled: boolean): void => {
  localStorage.setItem(REMINDERS_ENABLED_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new Event("hero-reminders-changed"));
};

const todayKey = () => new Date().toISOString().split("T")[0];

type FiredMap = { date: string; ids: string[] };

const loadFired = (): FiredMap => {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FiredMap;
      if (parsed.date === todayKey()) return parsed;
    }
  } catch {
    // reset
  }
  return { date: todayKey(), ids: [] };
};

export const hasFiredToday = (id: string): boolean => loadFired().ids.includes(id);

export const markFiredToday = (id: string): void => {
  const fired = loadFired();
  if (!fired.ids.includes(id)) fired.ids.push(id);
  localStorage.setItem(FIRED_KEY, JSON.stringify(fired));
};

/** Rappels dont l'heure est passée aujourd'hui et qui n'ont pas encore été déclenchés. */
export const getDueReminders = (now: Date = new Date()): Reminder[] => {
  if (!areRemindersEnabled()) return [];
  const current = now.getHours() * 60 + now.getMinutes();
  return loadReminders().filter((r) => {
    if (!r.enabled || hasFiredToday(r.id)) return false;
    const [h, m] = r.time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return false;
    const target = h * 60 + m;
    // Fenêtre de 10 minutes pour éviter de spammer d'anciens rappels
    return current >= target && current - target <= 10;
  });
};
