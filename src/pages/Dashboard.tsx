import { useState, useEffect } from "react";
import { Dumbbell, Salad, Sparkles } from "lucide-react";
import { Counter } from "@/components/Counter";
import { TimerCard } from "@/components/TimerCard";
import { CheckItem } from "@/components/CheckItem";
import { AddItemModal } from "@/components/AddItemModal";
import { NotificationBanner } from "@/components/NotificationBanner";
import { CureModal } from "@/components/CureModal";
import { BottomNav } from "@/components/BottomNav";

interface CustomItem {
  id: string;
  label: string;
  checked: boolean;
}

const Dashboard = () => {
  // Sport state
  const [pushups, setPushups] = useState(0);
  const [abs, setAbs] = useState(0);
  const [footing, setFooting] = useState(false);
  const [bikeComplete, setBikeComplete] = useState(false);
  const [customExercises, setCustomExercises] = useState<CustomItem[]>([]);

  // Nutrition state
  const [supplements, setSupplements] = useState({
    codLiverOil: false,
    pumpkinOil: false,
    garlicCapsule: false,
    antioxidantTea: false,
  });
  const [customSupplements, setCustomSupplements] = useState<CustomItem[]>([]);

  // Cure state
  const [activeCure, setActiveCure] = useState<string | null>(null);
  const [cureTasks, setCureTasks] = useState<CustomItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`longevity-${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      setPushups(data.pushups || 0);
      setAbs(data.abs || 0);
      setFooting(data.footing || false);
      setBikeComplete(data.bikeComplete || false);
      setSupplements(data.supplements || supplements);
      setCustomExercises(data.customExercises || []);
      setCustomSupplements(data.customSupplements || []);
      setActiveCure(data.activeCure || null);
      setCureTasks(data.cureTasks || []);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const data = {
      pushups,
      abs,
      footing,
      bikeComplete,
      supplements,
      customExercises,
      customSupplements,
      activeCure,
      cureTasks,
    };
    localStorage.setItem(`longevity-${today}`, JSON.stringify(data));
  }, [pushups, abs, footing, bikeComplete, supplements, customExercises, customSupplements, activeCure, cureTasks]);

  const toggleSupplement = (key: keyof typeof supplements) => {
    setSupplements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addCustomExercise = (label: string) => {
    setCustomExercises((prev) => [
      ...prev,
      { id: Date.now().toString(), label, checked: false },
    ]);
  };

  const toggleCustomExercise = (id: string) => {
    setCustomExercises((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addCustomSupplement = (label: string) => {
    setCustomSupplements((prev) => [
      ...prev,
      { id: Date.now().toString(), label, checked: false },
    ]);
  };

  const toggleCustomSupplement = (id: string) => {
    setCustomSupplements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleActivateCure = (cureId: string, tasks: string[], duration: number) => {
    setActiveCure(cureId);
    setCureTasks(
      tasks.map((label, i) => ({
        id: `cure-${i}`,
        label,
        checked: false,
      }))
    );
  };

  const handleDeactivateCure = () => {
    setActiveCure(null);
    setCureTasks([]);
  };

  const toggleCureTask = (id: string) => {
    setCureTasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Calculate progress
  const sportProgress = () => {
    let completed = 0;
    let total = 4 + customExercises.length;
    if (pushups >= 200) completed++;
    if (abs >= 100) completed++;
    if (footing) completed++;
    if (bikeComplete) completed++;
    completed += customExercises.filter((e) => e.checked).length;
    return Math.round((completed / total) * 100);
  };

  const nutritionProgress = () => {
    const supplementsComplete = Object.values(supplements).filter(Boolean).length;
    const customComplete = customSupplements.filter((s) => s.checked).length;
    const total = 4 + customSupplements.length;
    return Math.round(((supplementsComplete + customComplete) / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <NotificationBanner />

      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-gradient-emerald">Longevity Path</h1>
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
                  checked={task.checked}
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
            goal={200}
            value={pushups}
            onChange={setPushups}
            increments={[20, 50]}
          />

          <Counter
            label="Abdos"
            goal={100}
            value={abs}
            onChange={setAbs}
            increments={[20, 50]}
          />

          <CheckItem label="Footing" checked={footing} onToggle={() => setFooting(!footing)} />

          <TimerCard
            label="Vélo"
            duration={20 * 60}
            isComplete={bikeComplete}
            onComplete={setBikeComplete}
          />

          {customExercises.map((exercise) => (
            <CheckItem
              key={exercise.id}
              label={exercise.label}
              checked={exercise.checked}
              onToggle={() => toggleCustomExercise(exercise.id)}
            />
          ))}

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

          {customSupplements.map((supplement) => (
            <CheckItem
              key={supplement.id}
              label={supplement.label}
              checked={supplement.checked}
              onToggle={() => toggleCustomSupplement(supplement.id)}
            />
          ))}

          <AddItemModal onAdd={addCustomSupplement} type="supplement" />
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
