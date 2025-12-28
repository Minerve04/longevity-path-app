// Notification permission status
export type NotificationPermission = "granted" | "denied" | "default";

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return "Notification" in window;
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission as NotificationPermission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return "denied";
  
  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch {
    return "denied";
  }
};

// Show a notification
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  
  const notification = new Notification(title, {
    icon: "/hero-logo.jpg",
    badge: "/hero-logo.jpg",
    ...options,
  });

  // Auto close after 5 seconds
  setTimeout(() => notification.close(), 5000);

  // Handle click to focus the app
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

// Reminder interface
interface ScheduledReminder {
  id: string;
  title: string;
  time: string; // HH:mm format
  timeoutId?: ReturnType<typeof setTimeout>;
}

// Store for scheduled reminders
const scheduledReminders = new Map<string, ScheduledReminder>();

// Calculate milliseconds until next occurrence of a time
const getMsUntilTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  
  target.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime() - now.getTime();
};

// Schedule a reminder notification
export const scheduleReminder = (id: string, title: string, time: string): void => {
  // Clear existing reminder with same id
  cancelReminder(id);
  
  if (Notification.permission !== "granted") return;
  
  const msUntil = getMsUntilTime(time);
  
  const timeoutId = setTimeout(() => {
    showNotification("Hero - Rappel", {
      body: title,
      tag: `reminder-${id}`,
      requireInteraction: true,
    });
    
    // Reschedule for next day
    scheduleReminder(id, title, time);
  }, msUntil);
  
  scheduledReminders.set(id, { id, title, time, timeoutId });
};

// Cancel a scheduled reminder
export const cancelReminder = (id: string): void => {
  const reminder = scheduledReminders.get(id);
  if (reminder?.timeoutId) {
    clearTimeout(reminder.timeoutId);
  }
  scheduledReminders.delete(id);
};

// Cancel all scheduled reminders
export const cancelAllReminders = (): void => {
  scheduledReminders.forEach((reminder) => {
    if (reminder.timeoutId) {
      clearTimeout(reminder.timeoutId);
    }
  });
  scheduledReminders.clear();
};

// Schedule multiple reminders from an array
export const scheduleAllReminders = (
  reminders: Array<{ id: string; title: string; time: string; enabled: boolean }>
): void => {
  cancelAllReminders();
  
  reminders
    .filter((r) => r.enabled)
    .forEach((r) => scheduleReminder(r.id, r.title, r.time));
};
