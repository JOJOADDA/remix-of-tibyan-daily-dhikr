import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "tibyan_theme";
const THEME_COLORS: Record<"light" | "dark", string> = {
  light: "#faf7f2",
  dark: "#0b1310",
};

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

function applyTheme(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[resolved]);
}

/** إدارة الوضع الليلي/النهاري: يحفظ الاختيار ويطبقه على كل الشاشات. */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // قراءة الاختيار المحفوظ بعد الترطيب
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial: ThemeMode =
      saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    setMode(initial);
  }, []);

  // تطبيق الوضع + متابعة تغيّر إعداد النظام
  useEffect(() => {
    const next = resolve(mode);
    setResolved(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, mode);

    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const value = media.matches ? "dark" : "light";
      setResolved(value);
      applyTheme(value);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode(resolve(mode) === "dark" ? "light" : "dark");
  }, [mode]);

  return { mode, resolved, setMode, toggle, isDark: resolved === "dark" };
}
