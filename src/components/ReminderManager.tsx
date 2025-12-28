import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ReminderModal, Reminder } from "./ReminderModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  scheduleAllReminders,
  cancelReminder,
  getNotificationPermission,
} from "@/lib/notifications";

const STORAGE_KEY = "longevity-reminders";

const DEFAULT_REMINDERS: Reminder[] = [
  { id: "1", title: "Suppléments du matin", time: "08:00", enabled: true },
  { id: "2", title: "Session sport", time: "09:00", enabled: true },
  { id: "3", title: "Tisane antioxydante", time: "20:00", enabled: true },
];

export const ReminderManager = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  // Load reminders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReminders(JSON.parse(stored));
      } catch {
        setReminders(DEFAULT_REMINDERS);
      }
    } else {
      setReminders(DEFAULT_REMINDERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REMINDERS));
    }
  }, []);

  // Schedule notifications when reminders change
  useEffect(() => {
    if (reminders.length > 0 && getNotificationPermission() === "granted") {
      scheduleAllReminders(reminders);
    }
  }, [reminders]);

  // Save reminders to localStorage
  const saveReminders = (newReminders: Reminder[]) => {
    setReminders(newReminders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReminders));
  };

  const handleToggle = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    saveReminders(updated);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setModalOpen(true);
  };

  const handleDelete = (reminder: Reminder) => {
    setReminderToDelete(reminder);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reminderToDelete) {
      cancelReminder(reminderToDelete.id);
      const updated = reminders.filter((r) => r.id !== reminderToDelete.id);
      saveReminders(updated);
    }
    setDeleteDialogOpen(false);
    setReminderToDelete(null);
  };

  const handleAdd = () => {
    setEditingReminder(null);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Reminder, "id"> & { id?: string }) => {
    if (data.id) {
      // Update existing
      const updated = reminders.map((r) =>
        r.id === data.id ? { ...r, title: data.title, time: data.time } : r
      );
      saveReminders(updated);
    } else {
      // Add new
      const newReminder: Reminder = {
        id: Date.now().toString(),
        title: data.title,
        time: data.time,
        enabled: true,
      };
      saveReminders([...reminders, newReminder]);
    }
  };

  // Sort reminders by time
  const sortedReminders = [...reminders].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
      <h2 className="text-sm font-semibold text-foreground mb-3">
        Horaires des rappels
      </h2>

      <div className="glass-card rounded-2xl divide-y divide-border/50">
        {sortedReminders.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Aucun rappel configuré
          </div>
        ) : (
          sortedReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    reminder.enabled ? "bg-primary/10" : "bg-muted/50"
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 ${
                      reminder.enabled ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      reminder.enabled ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {reminder.time}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {reminder.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={() => handleToggle(reminder.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleEdit(reminder)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(reminder)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={handleAdd}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg glow-emerald z-40"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Edit/Add Modal */}
      <ReminderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reminder={editingReminder}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce rappel ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le rappel "{reminderToDelete?.title}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
