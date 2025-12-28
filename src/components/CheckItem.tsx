import { Check } from "lucide-react";

interface CheckItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export const CheckItem = ({ label, checked, onToggle }: CheckItemProps) => {
  return (
    <button
      onClick={onToggle}
      className={`w-full glass-card rounded-xl p-4 flex items-center gap-3 transition-all duration-200 animate-slide-up ${
        checked ? "border-primary/50" : "hover:bg-secondary/50"
      }`}
    >
      <div
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? "bg-primary border-primary glow-emerald"
            : "border-muted-foreground/30"
        }`}
      >
        {checked && <Check className="h-4 w-4 text-primary-foreground" />}
      </div>
      <span
        className={`text-sm font-medium transition-colors ${
          checked ? "text-primary" : "text-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
};
