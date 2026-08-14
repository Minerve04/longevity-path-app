import { useEffect } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { getDueReminders, markFiredToday } from "@/lib/reminders";
import { getNotificationPermission, showNotification } from "@/lib/notifications";
import { haptic } from "@/lib/haptics";

/**
 * Vérifie régulièrement les rappels dus.
 * Notification système si la permission est accordée, sinon rappel visuel (toast).
 */
export const ReminderRunner = () => {
  useEffect(() => {
    const check = () => {
      let due: ReturnType<typeof getDueReminders> = [];
      try {
        due = getDueReminders();
      } catch {
        return;
      }
      due.forEach((reminder) => {
        markFiredToday(reminder.id);
        haptic("medium");

        let shown = false;
        try {
          if (getNotificationPermission() === "granted") {
            showNotification("Hero — Rappel", {
              body: reminder.title,
              tag: `reminder-${reminder.id}`,
            });
            shown = true;
          }
        } catch {
          shown = false;
        }

        if (!shown || document.visibilityState === "visible") {
          toast(reminder.title, {
            description: `Rappel de ${reminder.time}`,
            icon: <Bell className="h-4 w-4 text-primary" />,
          });
        }
      });
    };

    check();
    const interval = setInterval(check, 30000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return null;
};

export default ReminderRunner;
