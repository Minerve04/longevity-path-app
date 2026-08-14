import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Dumbbell,
  Salad,
  Sparkles,
  Footprints,
  Fish,
  Droplets,
  Pill,
  CupSoda,
  Leaf,
  Check,
  PartyPopper,
  Target,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Counter } from "@/components/Counter";
import { TimerCard } from "@/components/TimerCard";
import { CheckItem } from "@/components/CheckItem";
import { AddItemModal } from "@/components/AddItemModal";
import { EditItemModal } from "@/components/EditItemModal";
import { SortableItem } from "@/components/SortableItem";
import { NotificationBanner } from "@/components/NotificationBanner";
import { CureModal } from "@/components/CureModal";
import { BottomNav } from "@/components/BottomNav";
import { loadGoals, Goals } from "@/lib/goals";
import { saveDayEntry, getCurrentStreak, getEntry } from "@/lib/history";
import { celebrate } from "@/lib/celebrate";
import { StreakBadge } from "@/components/StreakBadge";
import { GoalsEditor } from "@/components/GoalsEditor";
import { haptic } from "@/lib/haptics";

interface CustomItem {
  id: string;
  label: string;
}

interface DailyCheckedState {
  [id: string]: boolean;
}

// Storage keys
const CUSTOM_EXERCISES_KEY = "hero-custom-exercises";
const CUSTOM_SUPPLEMENTS_KEY = "hero-custom-supplements";
const getDailyKey = (date: Date = new Date()) => `longevity-${date.toISOString().split('T')[0]}`;
const getOldDailyKey = (date: Date = new Date()) => `longevity-${date.toDateString()}`;

const Dashboard = () => {
  // Sport state
  const [pushups, setPushups] = useState(0);
  const [abs, setAbs] = useState(0);
  const [squats, setSquats] = useState(0);
  const [footing, setFooting] = useState(false);
  const [bikeComplete, setBikeComplete] = useState(false);
  
  // Persistent custom items (labels only)
  const [customExercises, setCustomExercises] = useState<CustomItem[]>([]);
  const [customSupplements, setCustomSupplements] = useState<CustomItem[]>([]);
  
  // Daily checked states for custom items
  const [exerciseChecked, setExerciseChecked] = useState<DailyCheckedState>({});
  const [supplementChecked, setSupplementChecked] = useState<DailyCheckedState>({});

  // Nutrition state
  const [supplements, setSupplements] = useState({
    codLiverOil: false,
    pumpkinOil: false,
    garlicCapsule: false,
    antioxidantTea: false,
  });

  // Cure state
  const [activeCure, setActiveCure] = useState<string | null>(null);
  const [cureTasks, setCureTasks] = useState<CustomItem[]>([]);
  const [cureChecked, setCureChecked] = useState<DailyCheckedState>({});

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; label: string; type: "exercise" | "supplement" } | null>(null);

  // Goals
  const [goals, setGoals] = useState<Goals>(loadGoals);

  // Validation de la journée + série
  const [dayValidated, setDayValidated] = useState(false);
  const [streak, setStreak] = useState(0);

  // Accès rapide aux objectifs
  const [goalsEditorOpen, setGoalsEditorOpen] = useState(false);

  // Lueur de la jauge lorsque le % progresse
  const [gaugeGlow, setGaugeGlow] = useState(false);

  useEffect(() => {
    setDayValidated(getEntry(new Date())?.validated ?? false);
    setStreak(getCurrentStreak());
  }, []);


  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load persistent custom items and goals (once)
  useEffect(() => {
    const savedExercises = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    const savedSupplements = localStorage.getItem(CUSTOM_SUPPLEMENTS_KEY);
    
    if (savedExercises) {
      try {
        setCustomExercises(JSON.parse(savedExercises));
      } catch {
        setCustomExercises([]);
      }
    }
    
    if (savedSupplements) {
      try {
        setCustomSupplements(JSON.parse(savedSupplements));
      } catch {
        setCustomSupplements([]);
      }
    }

    // Reload goals when returning to dashboard
    setGoals(loadGoals());
  }, []);

  // Load daily progress with migration from old key format
  useEffect(() => {
    const today = new Date();
    const newKey = getDailyKey(today);
    const oldKey = getOldDailyKey(today);
    
    // Migrate old data if exists
    const oldData = localStorage.getItem(oldKey);
    if (oldData && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldData);
      localStorage.removeItem(oldKey);
    }
    
    const saved = localStorage.getItem(newKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPushups(data.pushups || 0);
        setAbs(data.abs || 0);
        setSquats(data.squats || 0);
        setFooting(data.footing || false);
        setBikeComplete(data.bikeComplete || false);
        setSupplements(data.supplements || supplements);
        
        // Load custom exercises checked state (support both old and new format)
        if (data.customExercises && Array.isArray(data.customExercises)) {
          const checked: DailyCheckedState = {};
          data.customExercises.forEach((e: { id: string; checked: boolean }) => {
            checked[e.id] = e.checked || false;
          });
          setExerciseChecked(checked);
        } else if (data.exerciseChecked) {
          setExerciseChecked(data.exerciseChecked);
        }
        
        // Load custom supplements checked state (support both old and new format)
        if (data.customSupplements && Array.isArray(data.customSupplements)) {
          const checked: DailyCheckedState = {};
          data.customSupplements.forEach((s: { id: string; checked: boolean }) => {
            checked[s.id] = s.checked || false;
          });
          setSupplementChecked(checked);
        } else if (data.supplementChecked) {
          setSupplementChecked(data.supplementChecked);
        }
        
        setActiveCure(data.activeCure || null);
        setCureTasks(data.cureTasks || []);
        setCureChecked(data.cureChecked || {});
      } catch {
        // Keep defaults
      }
    }
  }, []);

  // Save daily progress
  useEffect(() => {
    const data = {
      pushups,
      abs,
      squats,
      footing,
      bikeComplete,
      supplements,
      // Save custom items with full data for stats
      customExercises: customExercises.map(e => ({
        id: e.id,
        label: e.label,
        checked: exerciseChecked[e.id] || false
      })),
      customSupplements: customSupplements.map(s => ({
        id: s.id,
        label: s.label,
        checked: supplementChecked[s.id] || false
      })),
      activeCure,
      cureTasks,
      cureChecked,
    };
    localStorage.setItem(getDailyKey(), JSON.stringify(data));
  }, [pushups, abs, squats, footing, bikeComplete, supplements, exerciseChecked, supplementChecked, customExercises, customSupplements, activeCure, cureTasks, cureChecked]);

  // Save persistent custom items
  useEffect(() => {
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises));
  }, [customExercises]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_SUPPLEMENTS_KEY, JSON.stringify(customSupplements));
  }, [customSupplements]);

  const toggleSupplement = (key: keyof typeof supplements) => {
    setSupplements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addCustomExercise = (label: string) => {
    const newItem = { id: Date.now().toString(), label };
    setCustomExercises((prev) => [...prev, newItem]);
  };

  const removeCustomExercise = (id: string) => {
    setCustomExercises((prev) => prev.filter((item) => item.id !== id));
    setExerciseChecked((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleCustomExercise = (id: string) => {
    setExerciseChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const editCustomExercise = (id: string, newLabel: string) => {
    setCustomExercises((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const addCustomSupplement = (label: string) => {
    const newItem = { id: Date.now().toString(), label };
    setCustomSupplements((prev) => [...prev, newItem]);
  };

  const removeCustomSupplement = (id: string) => {
    setCustomSupplements((prev) => prev.filter((item) => item.id !== id));
    setSupplementChecked((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleCustomSupplement = (id: string) => {
    setSupplementChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const editCustomSupplement = (id: string, newLabel: string) => {
    setCustomSupplements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const openEditModal = (id: string, label: string, type: "exercise" | "supplement") => {
    setEditingItem({ id, label, type });
    setEditModalOpen(true);
  };

  const handleEditSave = (newLabel: string) => {
    if (!editingItem) return;
    if (editingItem.type === "exercise") {
      editCustomExercise(editingItem.id, newLabel);
    } else {
      editCustomSupplement(editingItem.id, newLabel);
    }
  };

  const handleExerciseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCustomExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSupplementDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCustomSupplements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleActivateCure = (cureId: string, tasks: string[], duration: number) => {
    setActiveCure(cureId);
    setCureTasks(
      tasks.map((label, i) => ({
        id: `cure-${i}`,
        label,
      }))
    );
    setCureChecked({});
  };

  const handleDeactivateCure = () => {
    setActiveCure(null);
    setCureTasks([]);
    setCureChecked({});
  };

  const toggleCureTask = (id: string) => {
    setCureChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate progress
  const sportProgress = () => {
    let completed = 0;
    let total = 5 + customExercises.length;
    if (pushups >= goals.pushups) completed++;
    if (abs >= goals.abs) completed++;
    if (squats >= goals.squats) completed++;
    if (footing) completed++;
    if (bikeComplete) completed++;
    completed += customExercises.filter((e) => exerciseChecked[e.id]).length;
    return Math.round((completed / total) * 100);
  };

  const nutritionProgress = () => {
    const supplementsComplete = Object.values(supplements).filter(Boolean).length;
    const customComplete = customSupplements.filter((s) => supplementChecked[s.id]).length;
    const total = 4 + customSupplements.length;
    return Math.round(((supplementsComplete + customComplete) / total) * 100);
  };

  const totalTasks =
    5 + customExercises.length + 4 + customSupplements.length + cureTasks.length;
  const doneTasks =
    (pushups >= goals.pushups ? 1 : 0) +
    (abs >= goals.abs ? 1 : 0) +
    (squats >= goals.squats ? 1 : 0) +
    (footing ? 1 : 0) +
    (bikeComplete ? 1 : 0) +
    customExercises.filter((e) => exerciseChecked[e.id]).length +
    Object.values(supplements).filter(Boolean).length +
    customSupplements.filter((s) => supplementChecked[s.id]).length +
    cureTasks.filter((t) => cureChecked[t.id]).length;
  const dayProgress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Lueur douce sur la jauge quand le % progresse
  const prevProgressRef = useRef(dayProgress);
  useEffect(() => {
    if (dayProgress > prevProgressRef.current) {
      setGaugeGlow(true);
      const t = setTimeout(() => setGaugeGlow(false), 950);
      prevProgressRef.current = dayProgress;
      return () => clearTimeout(t);
    }
    prevProgressRef.current = dayProgress;
  }, [dayProgress]);

  const handleValidateDay = () => {
    haptic("success");

    saveDayEntry({
      progress: dayProgress,
      done: doneTasks,
      total: totalTasks,
      validated: true,
    });
    setDayValidated(true);
    const newStreak = getCurrentStreak();
    setStreak(newStreak);
    celebrate("big");
    toast.success("Bravo ! Journée validée", {
      description:
        newStreak > 1
          ? `Série de ${newStreak} jours consécutifs. Continue comme ça !`
          : "Ton énergie grimpe, reviens demain pour lancer ta série.",
    });
  };

  // Historique du jour tenu à jour en continu
  useEffect(() => {
    if (totalTasks === 0) return;
    saveDayEntry({
      progress: dayProgress,
      done: doneTasks,
      total: totalTasks,
      validated: dayValidated,
    });
  }, [dayProgress, doneTasks, totalTasks, dayValidated]);

  // Célébration lorsqu'une section atteint 100 %
  const sportPct = sportProgress();
  const nutritionPct = nutritionProgress();
  const curePct = cureTasks.length
    ? Math.round((cureTasks.filter((t) => cureChecked[t.id]).length / cureTasks.length) * 100)
    : 0;
  const celebratedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const sections: { key: string; pct: number; label: string; message: string }[] = [
      { key: "sport", pct: sportPct, label: "Sport à 100 % !", message: "Ton corps te dit merci 💪" },
      {
        key: "nutrition",
        pct: nutritionPct,
        label: "Nutrition à 100 % !",
        message: "Tous tes compléments sont pris 🥗",
      },
      ...(cureTasks.length
        ? [{ key: "cure", pct: curePct, label: "Cure à 100 % !", message: "Constance parfaite ✨" }]
        : []),
    ];
    sections.forEach((section) => {
      if (section.pct >= 100 && !celebratedRef.current[section.key]) {
        celebratedRef.current[section.key] = true;
        celebrate("small");
        toast.success(section.label, { description: section.message });
      } else if (section.pct < 100) {
        celebratedRef.current[section.key] = false;
      }
    });
  }, [sportPct, nutritionPct, curePct, cureTasks.length]);

  return (
    <div className="min-h-screen bg-background pb-44">
      <NotificationBanner
        supplements={supplements}
        sportCompleted={{
          pushups: pushups >= goals.pushups,
          abs: abs >= goals.abs,
          squats: squats >= goals.squats,
          footing: footing,
          bike: bikeComplete,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border px-4 pt-4 pb-4 shadow-soft">
        <div className="max-w-md mx-auto">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gradient-emerald">Hero</h1>
              <p className="text-xs font-semibold text-muted-foreground capitalize">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGoalsEditorOpen(true)}
                aria-label="Régler mes objectifs"
                className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-primary transition-transform active:scale-95 hover:shadow-soft"
              >
                <Target className="h-4.5 w-4.5" strokeWidth={2.4} />
              </button>
              <div className="flex flex-col items-end gap-1">
                <StreakBadge streak={streak} />
                <span className="text-2xl font-extrabold text-foreground">{dayProgress}%</span>
              </div>
            </div>
          </div>

          {/* Jauge d'énergie du jour */}
          <div className="mt-3 h-4 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full gradient-energy transition-all duration-700 ease-out ${
                gaugeGlow ? "animate-gauge-glow" : ""
              }`}
              style={{ width: `${Math.max(dayProgress, 3)}%` }}
            />
          </div>

          <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
            {doneTasks}/{totalTasks} actions accomplies aujourd'hui
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Cure Button */}
        <CureModal
          activeCure={activeCure}
          onActivate={handleActivateCure}
          onDeactivate={handleDeactivateCure}
        />

        {/* Cure Tasks */}
        {cureTasks.length > 0 && (
          <section className="space-y-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-cure-soft flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cure" />
              </span>
              <h2 className="text-base font-extrabold text-foreground">Tâches Cure</h2>
            </div>
            <div className="space-y-3">
              {cureTasks.map((task) => (
                <CheckItem
                  key={task.id}
                  label={task.label}
                  checked={cureChecked[task.id] || false}
                  onToggle={() => toggleCureTask(task.id)}
                  variant="cure"
                  icon={Sparkles}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sport Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-sport-soft flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-sport" />
              </span>
              <h2 className="text-base font-extrabold text-foreground">Sport</h2>
            </div>
            <span className="text-xs font-bold text-sport bg-sport-soft rounded-full px-2.5 py-1">
              {sportPct}%
            </span>
          </div>

          <Counter
            label="Pompes"
            goal={goals.pushups}
            value={pushups}
            onChange={setPushups}
            increments={[20, 50]}
          />

          <Counter
            label="Abdos"
            goal={goals.abs}
            value={abs}
            onChange={setAbs}
            increments={[20, 50]}
          />

          <Counter
            label="Squats"
            goal={goals.squats}
            value={squats}
            onChange={setSquats}
            increments={[20, 50]}
          />

          <CheckItem
            label="Footing"
            checked={footing}
            onToggle={() => setFooting(!footing)}
            variant="sport"
            icon={Footprints}
          />

          <TimerCard
            label="Vélo"
            duration={goals.bikeDuration * 60}
            isComplete={bikeComplete}
            onComplete={setBikeComplete}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleExerciseDragEnd}
          >
            <SortableContext
              items={customExercises.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {customExercises.map((exercise) => (
                  <SortableItem
                    key={exercise.id}
                    id={exercise.id}
                    label={exercise.label}
                    checked={exerciseChecked[exercise.id] || false}
                    onToggle={() => toggleCustomExercise(exercise.id)}
                    onEdit={() => openEditModal(exercise.id, exercise.label, "exercise")}
                    onRemove={() => removeCustomExercise(exercise.id)}
                    variant="sport"
                    icon={Dumbbell}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <AddItemModal onAdd={addCustomExercise} type="exercise" />
        </section>

        {/* Nutrition Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-supplement-soft flex items-center justify-center">
                <Salad className="h-4 w-4 text-supplement" />
              </span>
              <h2 className="text-base font-extrabold text-foreground">Nutrition & Suppléments</h2>
            </div>
            <span className="text-xs font-bold text-supplement bg-supplement-soft rounded-full px-2.5 py-1">
              {nutritionPct}%
            </span>
          </div>

          <CheckItem
            label="Huile de foie de morue"
            checked={supplements.codLiverOil}
            onToggle={() => toggleSupplement("codLiverOil")}
            variant="supplement"
            icon={Fish}
          />
          <CheckItem
            label="Huile de courge"
            checked={supplements.pumpkinOil}
            onToggle={() => toggleSupplement("pumpkinOil")}
            variant="supplement"
            icon={Droplets}
          />
          <CheckItem
            label="Gélule d'ail"
            checked={supplements.garlicCapsule}
            onToggle={() => toggleSupplement("garlicCapsule")}
            variant="supplement"
            icon={Pill}
          />
          <CheckItem
            label="Tisane antioxydante"
            checked={supplements.antioxidantTea}
            onToggle={() => toggleSupplement("antioxidantTea")}
            variant="supplement"
            icon={CupSoda}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSupplementDragEnd}
          >
            <SortableContext
              items={customSupplements.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {customSupplements.map((supplement) => (
                  <SortableItem
                    key={supplement.id}
                    id={supplement.id}
                    label={supplement.label}
                    checked={supplementChecked[supplement.id] || false}
                    onToggle={() => toggleCustomSupplement(supplement.id)}
                    onEdit={() => openEditModal(supplement.id, supplement.label, "supplement")}
                    onRemove={() => removeCustomSupplement(supplement.id)}
                    variant="supplement"
                    icon={Leaf}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <AddItemModal onAdd={addCustomSupplement} type="supplement" />
        </section>
      </main>

      {/* CTA : Valider ma journée */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-3 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleValidateDay}
            disabled={dayProgress === 0}
            className={`w-full h-14 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
              dayProgress === 0
                ? "bg-muted text-muted-foreground"
                : dayValidated
                ? "bg-success text-white shadow-float"
                : "gradient-cta text-white"
            }`}
          >
            {dayValidated ? (
              <>
                <PartyPopper className="h-5 w-5" />
                Journée validée !
              </>
            ) : (
              <>
                <Check className="h-5 w-5" strokeWidth={3} />
                Valider ma journée
              </>
            )}
          </button>
        </div>
      </div>

      <BottomNav />

      {/* Edit Modal */}
      {editingItem && (
        <EditItemModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          currentLabel={editingItem.label}
          type={editingItem.type}
          onSave={handleEditSave}
        />
      )}

      {/* Réglage rapide des objectifs */}
      <GoalsEditor
        open={goalsEditorOpen}
        onOpenChange={setGoalsEditorOpen}
        onSave={() => setGoals(loadGoals())}
      />

    </div>
  );
};

export default Dashboard;
