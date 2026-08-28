import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { impact } from "@/services/haptics";

/** زر تبديل الوضع الليلي/النهاري — يعمل على جميع الشاشات. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void impact("light");
        toggle();
      }}
      aria-label={isDark ? "تشغيل الوضع النهاري" : "تشغيل الوضع الليلي"}
      title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
      className={`rounded-full border border-tibyan-border-light bg-tibyan-surface-light p-2.5 text-tibyan-subtle-light shadow-tactile transition-transform active:scale-90 dark:border-tibyan-border-dark dark:bg-tibyan-surface-dark dark:text-tibyan-subtle-dark dark:shadow-tactile-dark ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-tibyan-gold" />
      ) : (
        <Moon className="h-4 w-4 text-tibyan-green-600" />
      )}
    </button>
  );
}
