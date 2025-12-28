import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cure } from "@/lib/cures";

interface AddCureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (cure: Cure) => void;
}

export const AddCureModal = ({ open, onOpenChange, onAdd }: AddCureModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(21);
  const [tasks, setTasks] = useState<string[]>([""]);

  const handleAddTask = () => {
    setTasks([...tasks, ""]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const validTasks = tasks.filter((t) => t.trim());
    if (validTasks.length === 0) return;

    const newCure: Cure = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || "Cure personnalisée",
      duration,
      tasks: validTasks,
      icon: "custom",
      isCustom: true,
    };

    onAdd(newCure);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setDuration(21);
    setTasks([""]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Créer une Cure</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-foreground">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Spiruline"
              className="mt-1 bg-secondary/50 border-border/50"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Super aliment énergisant"
              className="mt-1 bg-secondary/50 border-border/50"
            />
          </div>

          <div>
            <Label htmlFor="duration" className="text-foreground">Durée (jours)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={90}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 21)}
              className="mt-1 bg-secondary/50 border-border/50"
            />
          </div>

          <div>
            <Label className="text-foreground">Tâches quotidiennes</Label>
            <div className="space-y-2 mt-1">
              {tasks.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    placeholder={`Tâche ${index + 1}`}
                    className="bg-secondary/50 border-border/50"
                  />
                  {tasks.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTask(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTask}
                className="w-full border-primary/50 text-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une tâche
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!name.trim() || tasks.filter((t) => t.trim()).length === 0}
          >
            Créer la Cure
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
