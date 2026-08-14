import confetti from "canvas-confetti";

/** Explosion de confettis énergétiques (orange / citron / émeraude). */
export const celebrate = (intensity: "small" | "big" = "big") => {
  const colors = ["#f97316", "#fb7185", "#facc15", "#22c55e", "#38bdf8"];

  if (intensity === "small") {
    confetti({
      particleCount: 60,
      spread: 60,
      startVelocity: 32,
      origin: { y: 0.7 },
      colors,
      scalar: 0.9,
    });
    return;
  }

  confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 }, colors });
  setTimeout(
    () => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors }),
    180
  );
  setTimeout(
    () => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors }),
    320
  );
};
