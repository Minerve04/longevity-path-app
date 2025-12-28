import { useLocation, Link } from "react-router-dom";
import { Calendar, BarChart3, Settings } from "lucide-react";

const navItems = [
  { path: "/", label: "Aujourd'hui", icon: Calendar },
  { path: "/stats", label: "Statistiques", icon: BarChart3 },
  { path: "/settings", label: "Paramètres", icon: Settings },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  isActive ? "bg-primary/10 glow-emerald" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
};
