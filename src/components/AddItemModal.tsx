import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddItemModalProps {
  onAdd: (label: string) => void;
  type: "exercise" | "supplement";
}

export const AddItemModal = ({ onAdd, type }: AddItemModalProps) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onAdd(label.trim());
      setLabel("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-10 border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter {type === "exercise" ? "un exercice" : "un supplément"}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Ajouter {type === "exercise" ? "un exercice" : "un supplément"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={type === "exercise" ? "Ex: Squats, Tractions..." : "Ex: Vitamine D, Magnésium..."}
            className="bg-secondary border-border/50 focus:border-primary"
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border/50"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!label.trim()}
            >
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
