import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  time: string;
  message: string;
}

interface NotificationBannerProps {
  supplements?: {
    codLiverOil: boolean;
    pumpkinOil: boolean;
    garlicCapsule: boolean;
    antioxidantTea: boolean;
  };
  sportCompleted?: {
    pushups: boolean;
    abs: boolean;
    footing: boolean;
    bike: boolean;
  };
}

const SCHEDULED_NOTIFICATIONS: Notification[] = [
  {
    id: "morning-supplements",
    time: "08:00",
    message: "Prendre les gélules (Ail et Huile de courge) et Huile de foie de morue",
  },
  {
    id: "sport-session",
    time: "09:00",
    message: "Début de la session Sport : Pompes, Abdos, Vélo ou Footing",
  },
  {
    id: "evening-tea",
    time: "20:00",
    message: "C'est l'heure de la tisane antioxydante",
  },
];

export const NotificationBanner = ({ supplements, sportCompleted }: NotificationBannerProps) => {
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Check if a notification's tasks are already completed
  const isTaskCompleted = (id: string): boolean => {
    switch (id) {
      case "morning-supplements":
        return !!(supplements?.codLiverOil && supplements?.pumpkinOil && supplements?.garlicCapsule);
      case "sport-session":
        return !!(sportCompleted?.pushups && sportCompleted?.abs && sportCompleted?.footing && sportCompleted?.bike);
      case "evening-tea":
        return !!supplements?.antioxidantTea;
      default:
        return false;
    }
  };

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      const matching = SCHEDULED_NOTIFICATIONS.find(
        (n) => n.time === currentTime && !dismissed.has(n.id) && !isTaskCompleted(n.id)
      );

      if (matching) {
        setActiveNotification(matching);
      }
    };

    // Check immediately and then every minute
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);

    return () => clearInterval(interval);
  }, [dismissed, supplements, sportCompleted]);

  // Auto-dismiss if tasks are completed while notification is shown
  useEffect(() => {
    if (activeNotification && isTaskCompleted(activeNotification.id)) {
      setActiveNotification(null);
    }
  }, [supplements, sportCompleted, activeNotification]);

  const dismissNotification = () => {
    if (activeNotification) {
      setDismissed((prev) => new Set([...prev, activeNotification.id]));
      setActiveNotification(null);
    }
  };

  // Demo: show first notification for 5 seconds on load (only if tasks not completed)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!activeNotification && !isTaskCompleted("morning-supplements")) {
        setActiveNotification(SCHEDULED_NOTIFICATIONS[0]);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!activeNotification) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-up">
      <div className="glass-card rounded-xl p-4 border-primary/30 glow-emerald">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">
                {activeNotification.time}
              </span>
            </div>
            <p className="text-sm text-foreground">{activeNotification.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={dismissNotification}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
