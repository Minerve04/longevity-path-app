import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ReminderModal } from "./ReminderModal";
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
  Reminder,
  loadReminders,
  saveReminders as persistReminders,
  areRemindersEnabled,
  setRemindersEnabled,
} from "@/lib/reminders";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/lib/notifications";

export const ReminderManager = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [permission, setPermission] = useState<string>("default");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  useEffect(() => {
    setReminders(loadReminders());
    setGlobalEnabled(areRemindersEnabled());
    try {
      setPermission(getNotificationPermission());
    } catch {
      setPermission("denied");
    }
  }, []);

  const saveReminders = (newReminders: Reminder[]) => {
    setReminders(newReminders);
    persistReminders(newReminders);
  };

  const handleGlobalToggle = async (checked: boolean) => {
    setGlobalEnabled(checked);
    setRemindersEnabled(checked);
    if (checked && permission === "default") {
      try {
        setPermission(await requestNotificationPermission());
      } catch {
        setPermission("denied");
      }
    }
  };

  const handleToggle = (id: string) => {
    saveReminders(
      reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
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
      saveReminders(reminders.filter((r) => r.id !== reminderToDelete.id));
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
      saveReminders(
        reminders.map((r) =>
          r.id === data.id ? { ...r, title: data.title, time: data.time } : r
        )
      );
    } else {
      saveReminders([
        ...reminders,
        { id: Date.now().toString(), title: data.title, time: data.time, enabled: true },
      ]);
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section className="animate-slide-up space-y-3" style={{ animationDelay: "0.4s" }}>
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              globalEnabled ? "bg-primary/10" : "bg-muted"
            }`}
          >
            {globalEnabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Rappels intelligents</h3>
            <p className="text-xs text-muted-foreground">
              {permission === "granted"
                ? "Notifications système activées"
                : "Rappels affichés dans l'app"}
            </p>
          </div>
        </div>
        <Switch checked={globalEnabled} onCheckedChange={handleGlobalToggle} />
      </div>

      <h2 className="text-sm font-bold text-foreground">Horaires des rappels</h2>

      <div className="glass-card rounded-2xl divide-y divide-border/50">
        {sortedReminders.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Aucun rappel configuré
          </div>
        ) : (
          sortedReminders.map((reminder) => (
            <div key={reminder.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    reminder.enabled && globalEnabled ? "bg-primary/10" : "bg-muted/50"
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 ${
                      reminder.enabled && globalEnabled
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold ${
                      reminder.enabled ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {reminder.time}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{reminder.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={reminder.enabled}
                  disabled={!globalEnabled}
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

      <Button variant="outline" className="w-full" onClick={handleAdd}>
        <Plus className="h-4 w-4 mr-1.5" />
        Ajouter un rappel
      </Button>

      <ReminderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reminder={editingReminder}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce rappel ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {reminderToDelete?.title} » ne te sera plus rappelé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
