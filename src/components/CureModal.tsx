import { useState } from "react";
import { Sparkles, Leaf, Zap, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Cure {
  id: string;
  name: string;
  description: string;
  duration: number;
  tasks: string[];
  icon: "detox" | "vitality";
}

const CURES: Cure[] = [
  {
    id: "detox",
    name: "Cure Détox",
    description: "Nettoyez votre organisme en profondeur",
    duration: 7,
    tasks: ["Jus de citron à jeun", "2L d'eau minimum"],
    icon: "detox",
  },
  {
    id: "vitality",
    name: "Cure Vitalité",
    description: "Boostez votre énergie naturellement",
    duration: 7,
    tasks: ["Smoothie vert", "Marche 30 min"],
    icon: "vitality",
  },
];

interface CureModalProps {
  activeCure: string | null;
  onActivate: (cureId: string, tasks: string[], duration: number) => void;
  onDeactivate: () => void;
}

export const CureModal = ({ activeCure, onActivate, onDeactivate }: CureModalProps) => {
  const [open, setOpen] = useState(false);

  const handleActivate = (cure: Cure) => {
    onActivate(cure.id, cure.tasks, cure.duration);
    setOpen(false);
  };

  const activeCureData = CURES.find((c) => c.id === activeCure);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={activeCure ? "default" : "outline"}
          className={`w-full h-12 ${
            activeCure
              ? "bg-primary hover:bg-primary/90 glow-emerald"
              : "border-primary/50 text-primary hover:bg-primary/10"
          }`}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {activeCure ? `${activeCureData?.name} Active` : "Activer une Cure"}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Programmes de Cure
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {CURES.map((cure) => {
            const isActive = activeCure === cure.id;
            const Icon = cure.icon === "detox" ? Leaf : Zap;

            return (
              <div
                key={cure.id}
                className={`rounded-xl p-4 border transition-all ${
                  isActive
                    ? "bg-primary/10 border-primary/50"
                    : "bg-secondary/50 border-border/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{cure.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {cure.description} • {cure.duration} jours
                    </p>
                    <div className="space-y-1">
                      {cure.tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  {isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={onDeactivate}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Désactiver
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handleActivate(cure)}
                      disabled={!!activeCure}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Activer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
