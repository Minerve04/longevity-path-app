import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Reminder {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
}

interface ReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: Reminder | null;
  onSave: (reminder: Omit<Reminder, "id"> & { id?: string }) => void;
}

export const ReminderModal = ({
  open,
  onOpenChange,
  reminder,
  onSave,
}: ReminderModalProps) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setTime(reminder.time);
    } else {
      setTitle("");
      setTime("08:00");
    }
  }, [reminder, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: reminder?.id,
      title: title.trim(),
      time,
      enabled: reminder?.enabled ?? true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {reminder ? "Modifier le rappel" : "Nouveau rappel"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-muted-foreground">
              Titre du rappel
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Prendre vitamines"
              className="bg-background/50 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm text-muted-foreground">
              Heure
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-background/50 border-border/50"
            />
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
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
