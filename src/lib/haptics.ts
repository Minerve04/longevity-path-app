// Petit helper de retour haptique (mobile), sans casser sur navigateurs non compatibles.

type HapticPattern = "light" | "medium" | "success";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  success: [12, 40, 24],
};

export const canVibrate = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export const haptic = (pattern: HapticPattern = "light"): void => {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Ignoré si l'appareil refuse la vibration
  }
};
