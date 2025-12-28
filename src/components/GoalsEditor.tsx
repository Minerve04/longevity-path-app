import { useState, useEffect } from "react";
import { Target, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Goals, loadGoals, saveGoals, DEFAULT_GOALS } from "@/lib/goals";

interface GoalsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const GoalsEditor = ({ open, onOpenChange, onSave }: GoalsEditorProps) => {
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);

  useEffect(() => {
    if (open) {
      setGoals(loadGoals());
    }
  }, [open]);

  const handleSave = () => {
    saveGoals(goals);
    onSave();
    onOpenChange(false);
  };

  const updateGoal = (key: keyof Goals, delta: number) => {
    setGoals((prev) => {
      const newValue = Math.max(10, prev[key] + delta);
      return { ...prev, [key]: newValue };
    });
  };

  const setGoal = (key: keyof Goals, value: number) => {
    setGoals((prev) => ({ ...prev, [key]: Math.max(10, value) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Personnaliser les objectifs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pushups Goal */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Objectif Pompes</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border/50"
                onClick={() => updateGoal("pushups", -10)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={goals.pushups}
                  onChange={(e) => setGoal("pushups", parseInt(e.target.value) || 10)}
                  className="w-full text-center text-2xl font-bold bg-transparent border-none outline-none text-foreground"
                />
                <span className="text-xs text-muted-foreground">répétitions</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border/50"
                onClick={() => updateGoal("pushups", 10)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Abs Goal */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Objectif Abdos</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border/50"
                onClick={() => updateGoal("abs", -10)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={goals.abs}
                  onChange={(e) => setGoal("abs", parseInt(e.target.value) || 10)}
                  className="w-full text-center text-2xl font-bold bg-transparent border-none outline-none text-foreground"
                />
                <span className="text-xs text-muted-foreground">répétitions</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border/50"
                onClick={() => updateGoal("abs", 10)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bike Duration */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Durée Vélo</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border/50"
                onClick={() => updateGoal("bikeDuration", -5)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={goals.bikeDuration}
                  onChange={(e) => setGoal("bikeDuration", parseInt(e.target.value) || 5)}
                  className="w-full text-center text-2xl font-bold bg-transparent border-none outline-none text-foreground"
                />
                <span className="text-xs text-muted-foreground">minutes</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-border/50"
                onClick={() => updateGoal("bikeDuration", 5)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border/50"
          >
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
