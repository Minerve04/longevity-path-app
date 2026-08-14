import { useEffect, useRef, useState } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";

interface CounterProps {
  label: string;
  goal: number;
  value: number;
  onChange: (value: number) => void;
  increments?: number[];
}

export const Counter = ({ 
  label, 
  goal, 
  value, 
  onChange, 
  increments = [10, 20, 50] 
}: CounterProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const progress = Math.min((value / goal) * 100, 100);
  const isComplete = value >= goal;

  const handleIncrement = (amount: number) => {
    setIsAnimating(true);
    onChange(Math.max(0, value + amount));
    setTimeout(() => setIsAnimating(false), 200);
  };

  const handleReset = () => {
    onChange(0);
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
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out gradient-energy"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className={`text-right min-w-[80px] transition-transform ${isAnimating ? "animate-counter" : ""}`}>
          <span className={`text-2xl font-extrabold ${isComplete ? "text-sport" : "text-foreground"}`}>
            {value}
          </span>
          <span className="text-sm text-muted-foreground">/{goal}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 border-border/50 hover:bg-secondary"
          onClick={() => handleIncrement(-10)}
        >
          <Minus className="h-3 w-3 mr-1" />
          10
        </Button>
        {increments.map((inc) => (
          <Button
            key={inc}
            variant="secondary"
            size="sm"
            className="h-9 px-3 bg-secondary hover:bg-secondary/80"
            onClick={() => handleIncrement(inc)}
          >
            <Plus className="h-3 w-3 mr-1" />
            {inc}
          </Button>
        ))}
      </div>
    </div>
  );
};
