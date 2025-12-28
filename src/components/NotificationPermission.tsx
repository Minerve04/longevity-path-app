import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
} from "@/lib/notifications";

const NotificationPermission = () => {
  const [permission, setPermission] = useState<string>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem("notification-prompt-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    if (!isNotificationSupported()) return;

    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);

    // Only show banner if permission is default (not yet asked)
    if (currentPermission === "default") {
      // Delay showing to not overwhelm user on first visit
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === "granted") {
      showNotification("Notifications activées", {
        body: "Vous recevrez désormais vos rappels Hero",
      });
    }

    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  if (!isVisible || isDismissed || permission !== "default") return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-up">
      <div className="max-w-md mx-auto glass-card rounded-xl p-4 shadow-lg border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Activer les notifications
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Recevez des rappels pour vos habitudes et exercices quotidiens
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-3 ml-13">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="border-border/50 text-muted-foreground"
          >
            Plus tard
          </Button>
          <Button
            size="sm"
            onClick={handleEnable}
            className="gap-1.5"
          >
            <Bell className="h-3.5 w-3.5" />
            Autoriser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission;
