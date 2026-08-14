import { useState } from "react";
import { CopyCheck, Save, Repeat } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { applyRoutine, loadRoutine, saveRoutineFromToday, Routine } from "@/lib/routine";
import { haptic } from "@/lib/haptics";

export const RoutineCard = () => {
  const [routine, setRoutine] = useState<Routine | null>(loadRoutine);

  const handleSave = () => {
    haptic("light");
    setRoutine(saveRoutineFromToday());
    toast.success("Routine type enregistrée", {
      description: "Tu pourras repartir de cette configuration chaque jour.",
    });
  };

  const handleApply = () => {
    haptic("success");
    if (!applyRoutine()) {
      toast.error("Aucune routine enregistrée pour l'instant");
      return;
    }
    toast.success("Journée réinitialisée depuis ta routine");
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
  };

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Repeat className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Routine type</h3>
          <p className="text-xs text-muted-foreground">
            {routine
              ? `${routine.exercises.length} exos • ${routine.supplements.length} compléments • ${routine.cureTasks.length} tâches cure`
              : "Enregistre ta configuration habituelle"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1.5" />
          Enregistrer
        </Button>
        <Button
          size="sm"
          className="flex-1 gradient-cta text-white"
          onClick={handleApply}
          disabled={!routine}
        >
          <CopyCheck className="h-4 w-4 mr-1.5" />
          Dupliquer
        </Button>
      </div>
    </div>
  );
};
