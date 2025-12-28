import { Bell, Moon, Trash2, Info } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ReminderManager } from "@/components/ReminderManager";

const SettingsPage = () => {
  const handleClearData = () => {
    if (confirm("Voulez-vous vraiment effacer toutes les données ?")) {
      localStorage.clear();
      window.location.reload();
    }
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
        {/* Notifications */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">Rappels quotidiens</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        {/* Dark Mode */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Moon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Mode sombre</h3>
                <p className="text-xs text-muted-foreground">Toujours activé</p>
              </div>
            </div>
            <Switch defaultChecked disabled />
          </div>
        </div>

        {/* Clear Data */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
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
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Longevity Path</h3>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </div>

        {/* Reminder Manager */}
        <ReminderManager />
      </main>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
