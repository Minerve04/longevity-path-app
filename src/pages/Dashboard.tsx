import { useState, useEffect } from "react";
import { Dumbbell, Salad, Sparkles } from "lucide-react";
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
const getDailyKey = () => `longevity-${new Date().toDateString()}`;

const Dashboard = () => {
  // Sport state
  const [pushups, setPushups] = useState(0);
  const [abs, setAbs] = useState(0);
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

  // Load daily progress
  useEffect(() => {
    const saved = localStorage.getItem(getDailyKey());
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPushups(data.pushups || 0);
        setAbs(data.abs || 0);
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
  }, [pushups, abs, footing, bikeComplete, supplements, exerciseChecked, supplementChecked, customExercises, customSupplements, activeCure, cureTasks, cureChecked]);

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
    let total = 4 + customExercises.length;
    if (pushups >= goals.pushups) completed++;
    if (abs >= goals.abs) completed++;
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <NotificationBanner />

      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gradient-emerald">Hero</h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
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
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Tâches Cure</h2>
            </div>
            <div className="space-y-2">
              {cureTasks.map((task) => (
                <CheckItem
                  key={task.id}
                  label={task.label}
                  checked={cureChecked[task.id] || false}
                  onToggle={() => toggleCureTask(task.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sport Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Sport</h2>
            </div>
            <span className="text-xs text-muted-foreground">{sportProgress()}% complété</span>
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

          <CheckItem label="Footing" checked={footing} onToggle={() => setFooting(!footing)} />

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
              <div className="space-y-2">
                {customExercises.map((exercise) => (
                  <SortableItem
                    key={exercise.id}
                    id={exercise.id}
                    label={exercise.label}
                    checked={exerciseChecked[exercise.id] || false}
                    onToggle={() => toggleCustomExercise(exercise.id)}
                    onEdit={() => openEditModal(exercise.id, exercise.label, "exercise")}
                    onRemove={() => removeCustomExercise(exercise.id)}
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
              <Salad className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Nutrition & Suppléments</h2>
            </div>
            <span className="text-xs text-muted-foreground">{nutritionProgress()}% complété</span>
          </div>

          <CheckItem
            label="Huile de foie de morue"
            checked={supplements.codLiverOil}
            onToggle={() => toggleSupplement("codLiverOil")}
          />
          <CheckItem
            label="Huile de courge"
            checked={supplements.pumpkinOil}
            onToggle={() => toggleSupplement("pumpkinOil")}
          />
          <CheckItem
            label="Gélule d'ail"
            checked={supplements.garlicCapsule}
            onToggle={() => toggleSupplement("garlicCapsule")}
          />
          <CheckItem
            label="Tisane antioxydante"
            checked={supplements.antioxidantTea}
            onToggle={() => toggleSupplement("antioxidantTea")}
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
              <div className="space-y-2">
                {customSupplements.map((supplement) => (
                  <SortableItem
                    key={supplement.id}
                    id={supplement.id}
                    label={supplement.label}
                    checked={supplementChecked[supplement.id] || false}
                    onToggle={() => toggleCustomSupplement(supplement.id)}
                    onEdit={() => openEditModal(supplement.id, supplement.label, "supplement")}
                    onRemove={() => removeCustomSupplement(supplement.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <AddItemModal onAdd={addCustomSupplement} type="supplement" />
        </section>
      </main>

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
    </div>
  );
};

export default Dashboard;
