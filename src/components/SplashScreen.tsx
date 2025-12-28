import { useState, useEffect } from "react";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => setIsFading(true), 1500);
    // Remove from DOM after fade animation (0.5s)
    const hideTimer = setTimeout(() => setIsVisible(false), 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-scale-in">
        <img
          src="/hero-logo.jpg"
          alt="Hero Logo"
          className="w-24 h-24 rounded-2xl shadow-lg glow-emerald animate-pulse-soft"
        />
        <h1 className="text-3xl font-bold text-gradient-emerald">Hero</h1>
        <p className="text-sm text-muted-foreground">Coaching Santé</p>
      </div>
    </div>
  );
};

export default SplashScreen;
