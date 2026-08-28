import { BookOpen, Compass, Settings } from "lucide-react";
import type React from "react";
import { impact } from "@/services/haptics";

export type TabType = "counter" | "library" | "settings";

interface NavItem {
  id: TabType;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "counter", label: "المسبحة", icon: Compass },
  { id: "library", label: "الروضة", icon: BookOpen },
  { id: "settings", label: "التنبيهات", icon: Settings },
];

export function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  return (
    <div className="bottom-safe-nav pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 font-sans">
      <nav
        dir="rtl"
        className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-tibyan-border-light/80 bg-tibyan-surface-light/85 p-1.5 shadow-tactile backdrop-blur-md transition-all duration-300 dark:border-tibyan-border-dark/80 dark:bg-tibyan-surface-dark/85 dark:shadow-tactile-dark"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                void impact("light");
                onTabChange(item.id);
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={`relative flex select-none items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium transition-all duration-300 ease-out active:scale-95 ${
                isActive
                  ? "bg-tibyan-green-600 text-tibyan-ink-dark shadow-sm dark:bg-tibyan-green-700"
                  : "text-tibyan-subtle-light hover:text-tibyan-ink-light dark:text-tibyan-subtle-dark dark:hover:text-tibyan-ink-dark"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}
              />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isActive ? "max-w-20 font-semibold opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-tibyan-gold" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
