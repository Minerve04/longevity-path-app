import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerCardProps {
  label: string;
  duration: number; // in seconds
  isComplete: boolean;
  onComplete: (complete: boolean) => void;
}

export const TimerCard = ({ label, duration, isComplete, onComplete }: TimerCardProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = ((duration - timeLeft) / duration) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    onComplete(false);
  };

  const markComplete = () => {
    setTimeLeft(0);
    setIsRunning(false);
    onComplete(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`rounded-2xl p-4 border-2 shadow-soft animate-slide-up transition-all duration-300 ${
        isComplete ? "bg-sport-soft border-sport" : "bg-card border-border/60"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-base font-bold ${isComplete ? "text-sport" : "text-foreground"}`}>
          {label}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={resetTimer}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 gradient-energy"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-right min-w-[60px]">
          <span className={`text-2xl font-extrabold ${isComplete ? "text-sport" : "text-foreground"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={isRunning ? "outline" : "default"}
          size="sm"
          className={`h-9 flex-1 ${isRunning ? "border-border/50" : "bg-primary hover:bg-primary/90"}`}
          onClick={toggleTimer}
          disabled={isComplete}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Démarrer
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-3"
          onClick={markComplete}
          disabled={isComplete}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
