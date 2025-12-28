import { useState, useEffect } from "react";
import { Sparkles, Leaf, Pill, Flower2, Brain, Heart, Circle, Plus, X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cure, DEFAULT_CURES, loadCustomCures, saveCustomCures, getAllCures } from "@/lib/cures";
import { AddCureModal } from "./AddCureModal";

const getIconComponent = (icon: Cure["icon"]) => {
  switch (icon) {
    case "ginger":
      return Flower2;
    case "turmeric":
      return Leaf;
    case "propolis":
      return Heart;
    case "rhodiola":
      return Brain;
    case "chana":
      return Pill;
    case "reishi":
      return Circle;
    case "custom":
    default:
      return Sparkles;
  }
};

interface CureModalProps {
  activeCure: string | null;
  onActivate: (cureId: string, tasks: string[], duration: number) => void;
  onDeactivate: () => void;
}

export const CureModal = ({ activeCure, onActivate, onDeactivate }: CureModalProps) => {
  const [open, setOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [customCures, setCustomCures] = useState<Cure[]>([]);

  useEffect(() => {
    setCustomCures(loadCustomCures());
  }, []);

  const allCures = [...DEFAULT_CURES, ...customCures];

  const handleActivate = (cure: Cure) => {
    onActivate(cure.id, cure.tasks, cure.duration);
    setOpen(false);
  };

  const handleAddCure = (cure: Cure) => {
    const updated = [...customCures, cure];
    setCustomCures(updated);
    saveCustomCures(updated);
  };

  const handleDeleteCure = (cureId: string) => {
    const updated = customCures.filter((c) => c.id !== cureId);
    setCustomCures(updated);
    saveCustomCures(updated);
  };

  const activeCureData = allCures.find((c) => c.id === activeCure);

  return (
    <>
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
        <DialogContent className="glass-card border-border/50 sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Programmes de Cure
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {allCures.map((cure) => {
              const isActive = activeCure === cure.id;
              const Icon = getIconComponent(cure.icon);

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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{cure.name}</h3>
                        {cure.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                            Perso
                          </span>
                        )}
                      </div>
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
                  <div className="mt-3 flex gap-2">
                    {isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={onDeactivate}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Désactiver
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => handleActivate(cure)}
                          disabled={!!activeCure}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Activer
                        </Button>
                        {cure.isCustom && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCure(cure.id)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AddCureModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdd={handleAddCure}
      />
    </>
  );
};
