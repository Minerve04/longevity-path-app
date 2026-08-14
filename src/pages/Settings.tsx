import { useState } from "react";
import { Bell, Moon, Trash2, Info, Target } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ReminderManager } from "@/components/ReminderManager";
import { GoalsEditor } from "@/components/GoalsEditor";
import { loadGoals } from "@/lib/goals";

const SettingsPage = () => {
  const [goalsEditorOpen, setGoalsEditorOpen] = useState(false);
  const [goals, setGoals] = useState(loadGoals);

  const handleClearData = () => {
    if (confirm("Voulez-vous vraiment effacer toutes les données ?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const refreshGoals = () => {
    setGoals(loadGoals());
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gradient-emerald">Paramètres</h1>
          <p className="text-xs text-muted-foreground">Personnalisez votre expérience</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Goals */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Objectifs</h3>
                <p className="text-xs text-muted-foreground">
                  {goals.pushups} pompes • {goals.abs} abdos • {goals.bikeDuration} min vélo
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border/50"
              onClick={() => setGoalsEditorOpen(true)}
            >
              Modifier
            </Button>
          </div>
        </div>

        {/* Routine type */}
        <RoutineCard />


        {/* Clear Data */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Effacer les données</h3>
                <p className="text-xs text-muted-foreground">Réinitialiser l'application</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={handleClearData}
            >
              Effacer
            </Button>
          </div>
        </div>

        {/* About */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Hero</h3>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </div>

        {/* Reminder Manager */}
        <ReminderManager />
      </main>

      <BottomNav />

      {/* Goals Editor Modal */}
      <GoalsEditor
        open={goalsEditorOpen}
        onOpenChange={setGoalsEditorOpen}
        onSave={refreshGoals}
      />
    </div>
  );
};

export default SettingsPage;
