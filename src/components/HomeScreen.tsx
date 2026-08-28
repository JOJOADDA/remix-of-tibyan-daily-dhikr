import { RotateCcw, Sparkles, Vibrate, VibrateOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DHIKR_LIST } from "@/data/dhikr";
import { impact } from "@/services/haptics";

export function HomeScreen() {
  const [activeDhikrIndex, setActiveDhikrIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [isPressed, setIsPressed] = useState(false);

  const currentDhikr = DHIKR_LIST[activeDhikrIndex] ?? DHIKR_LIST[0]!;
  const progressPercent = Math.min(((count % currentDhikr.target) / currentDhikr.target) * 100, 100);


  // قراءة العدادات المحفوظة بعد الترطيب فقط
  useEffect(() => {
    const saved = window.localStorage.getItem("tibyan_current_count");
    const savedTotal = window.localStorage.getItem("tibyan_total_count");
    const savedHaptic = window.localStorage.getItem("tibyan_haptic_enabled");
    const savedIndex = Number(window.localStorage.getItem("tibyan_dhikr_index"));
    if (saved) setCount(parseInt(saved, 10) || 0);
    if (savedTotal) setTotalCount(parseInt(savedTotal, 10) || 0);
    if (savedHaptic !== null) setHapticEnabled(savedHaptic === "1");
    if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < DHIKR_LIST.length) {
      setActiveDhikrIndex(savedIndex);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tibyan_current_count", count.toString());
    window.localStorage.setItem("tibyan_total_count", totalCount.toString());
  }, [count, totalCount]);

  useEffect(() => {
    window.localStorage.setItem("tibyan_haptic_enabled", hapticEnabled ? "1" : "0");
    window.localStorage.setItem("tibyan_dhikr_index", String(activeDhikrIndex));
  }, [hapticEnabled, activeDhikrIndex]);

  const triggerHaptic = useCallback(
    (isTargetReached: boolean) => {
      if (!hapticEnabled) return;
      void impact(isTargetReached ? "heavy" : "light");
    },
    [hapticEnabled],
  );

  const handleScreenTap = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 120);

    const nextCount = count + 1;
    triggerHaptic(nextCount % currentDhikr.target === 0);
    setCount(nextCount);
    setTotalCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setCount(0);
    triggerHaptic(false);
  };

  const toggleDhikr = () => {
    setActiveDhikrIndex((prev) => (prev + 1) % DHIKR_LIST.length);
    setCount(0);
    void impact("light");
  };

  const circumference = 276.46;

  return (
    <div
      onClick={handleScreenTap}
      className="app-screen px-safe pt-safe relative flex w-full cursor-pointer select-none flex-col justify-between overflow-hidden bg-tibyan-canvas-light font-sans transition-colors duration-500 dark:bg-tibyan-canvas-dark"
    >
      <header className="z-10 flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-tibyan-green-600/20 bg-tibyan-green-600/10 dark:border-tibyan-green-emerald/20 dark:bg-tibyan-green-emerald/10">
            <span className="font-amiri text-lg font-bold text-tibyan-green-600 dark:text-tibyan-green-emerald">
              ت
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wider text-tibyan-ink-light dark:text-tibyan-ink-dark">
            تِبْيَان
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <ThemeToggle />

          <button
            type="button"
            onClick={() => {
              const next = !hapticEnabled;
              setHapticEnabled(next);
              if (next) void impact("medium");
            }}
            aria-pressed={hapticEnabled}
            aria-label="الاهتزاز اللمسي"
            title="الاهتزاز اللمسي"
            className="rounded-full border border-tibyan-border-light bg-tibyan-surface-light p-2.5 text-tibyan-subtle-light shadow-tactile transition-transform active:scale-90 dark:border-tibyan-border-dark dark:bg-tibyan-surface-dark dark:text-tibyan-subtle-dark dark:shadow-tactile-dark"
          >
            {hapticEnabled ? (
              <Vibrate className="h-4 w-4" />
            ) : (
              <VibrateOff className="h-4 w-4 text-rose-400" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="إعادة ضبط العداد"
            title="إعادة ضبط العداد"
            className="rounded-full border border-tibyan-border-light bg-tibyan-surface-light p-2.5 text-tibyan-subtle-light shadow-tactile transition-transform active:scale-90 dark:border-tibyan-border-dark dark:bg-tibyan-surface-dark dark:text-tibyan-subtle-dark dark:shadow-tactile-dark"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="z-10 mx-auto my-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-4 text-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleDhikr();
          }}
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-tibyan-green-100 bg-tibyan-green-50 px-3 py-1 text-[11px] font-medium text-tibyan-green-600 transition-transform active:scale-95 dark:border-tibyan-border-dark dark:bg-tibyan-surface-dark dark:text-tibyan-green-emerald"
        >
          <Sparkles className="h-3 w-3 text-tibyan-gold" />
          <span>تغيير الصيغة</span>
        </button>

        <div className="mb-8 flex min-h-[110px] items-center justify-center px-4">
          <p className="font-amiri text-2xl leading-[2.3] text-tibyan-green-700 drop-shadow-sm transition-all duration-300 md:text-3xl dark:text-tibyan-green-emerald">
            {currentDhikr.text}
          </p>
        </div>

        <div className="relative my-2 flex aspect-square w-full max-w-[16rem] items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-tibyan-border-light dark:text-tibyan-border-dark"
              strokeWidth="2"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-tibyan-gold transition-all duration-300 ease-out"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * progressPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div
            className={`absolute flex flex-col items-center justify-center transition-transform duration-100 ${
              isPressed ? "scale-95" : "scale-100"
            }`}
          >
            <span className="font-sans text-5xl sm:text-6xl font-light tracking-tighter text-tibyan-ink-light dark:text-tibyan-ink-dark">
              {count}
            </span>
            <span className="mt-1 text-xs font-medium text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
              الهدف: {currentDhikr.target}
            </span>
          </div>
        </div>

        <p className="mt-6 max-w-xs text-xs leading-relaxed text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
          {currentDhikr.virtue}
        </p>
      </main>

      <footer className="pb-app z-10 flex items-center justify-between border-t border-tibyan-border-light/60 pt-4 text-xs dark:border-tibyan-border-dark/60">
        <div className="flex flex-col">
          <span className="text-[10px] text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
            مجموع الصلوات
          </span>
          <span className="text-sm font-semibold text-tibyan-ink-light dark:text-tibyan-ink-dark">
            {totalCount}
          </span>
        </div>

        <span className="text-[11px] text-tibyan-subtle-light/70 dark:text-tibyan-subtle-dark/70">
          المس في أي مكان للتسبيح
        </span>
      </footer>
    </div>
  );
}
