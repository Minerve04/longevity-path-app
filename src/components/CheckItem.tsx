import { useEffect, useRef, useState } from "react";
import { Check, LucideIcon, CircleDot } from "lucide-react";
import { haptic } from "@/lib/haptics";

export type CheckVariant = "sport" | "supplement" | "cure";

interface CheckItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  variant?: CheckVariant;
  icon?: LucideIcon;
}

const variantStyles: Record<
  CheckVariant,
  { active: string; idle: string; iconBg: string; iconColor: string; check: string; text: string }
> = {
  sport: {
    active: "bg-sport-soft border-sport",
    idle: "bg-card border-border/60",
    iconBg: "bg-sport-soft",
    iconColor: "text-sport",
    check: "bg-sport border-sport",
    text: "text-sport",
  },
  supplement: {
    active: "bg-supplement-soft border-supplement",
    idle: "bg-card border-border/60",
    iconBg: "bg-supplement-soft",
    iconColor: "text-supplement",
    check: "bg-supplement border-supplement",
    text: "text-supplement",
  },
  cure: {
    active: "bg-cure-soft border-cure",
    idle: "bg-card border-border/60",
    iconBg: "bg-cure-soft",
    iconColor: "text-cure",
    check: "bg-cure border-cure",
    text: "text-cure",
  },
};

export const CheckItem = ({
  label,
  checked,
  onToggle,
  variant = "sport",
  icon: Icon = CircleDot,
}: CheckItemProps) => {
  const s = variantStyles[variant];
  const [popping, setPopping] = useState(false);
  const prevChecked = useRef(checked);

  useEffect(() => {
    if (checked && !prevChecked.current) {
      setPopping(true);
      const t = setTimeout(() => setPopping(false), 450);
      prevChecked.current = checked;
      return () => clearTimeout(t);
    }
    prevChecked.current = checked;
  }, [checked]);

  const handleClick = () => {
    haptic(checked ? "light" : "medium");
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full rounded-2xl p-4 flex items-center gap-4 border-2 shadow-soft text-left
        transition-all duration-300 ease-out active:scale-[0.98] hover:shadow-float
        ${popping ? "animate-pop" : "animate-slide-up"}
        ${checked ? s.active : s.idle}`}
    >

      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          checked ? "bg-card" : s.iconBg
        }`}
      >
        <Icon className={`h-6 w-6 ${s.iconColor}`} strokeWidth={2.2} />
      </div>

      <span
        className={`flex-1 text-base font-bold transition-colors duration-300 ${
          checked ? s.text : "text-foreground"
        }`}
      >
        {label}
      </span>

      <div
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          checked ? s.check : "border-muted-foreground/25 bg-secondary"
        }`}
      >
        {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </div>
    </button>
  );
};
