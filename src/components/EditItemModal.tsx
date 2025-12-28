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

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLabel: string;
  type: "exercise" | "supplement";
  onSave: (newLabel: string) => void;
}

export const EditItemModal = ({
  open,
  onOpenChange,
  currentLabel,
  type,
  onSave,
}: EditItemModalProps) => {
  const [label, setLabel] = useState(currentLabel);

  useEffect(() => {
    setLabel(currentLabel);
  }, [currentLabel, open]);

  const handleSave = () => {
    if (label.trim() && label.trim() !== currentLabel) {
      onSave(label.trim());
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Modifier {type === "exercise" ? "l'exercice" : "le supplément"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label" className="text-sm text-muted-foreground">
              Nom
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={type === "exercise" ? "Ex: Squats, Tractions..." : "Ex: Vitamine D, Magnésium..."}
              className="bg-background/50 border-border/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
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
            disabled={!label.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
