// طبقة الاهتزاز اللمسي: تعمل على الويب (navigator.vibrate) وعلى الأجهزة عبر Capacitor إن توفر.
type ImpactKind = "light" | "heavy";

const HAPTICS_MODULE = "@capacitor/haptics";

interface HapticsModule {
  Haptics: { impact: (options: { style: unknown }) => Promise<void> };
  ImpactStyle: Record<string, unknown>;
}

const isBrowser = () => typeof window !== "undefined";

function isNative(): boolean {
  if (!isBrowser()) return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

async function loadNativeHaptics(): Promise<HapticsModule | null> {
  try {
    return (await import(/* @vite-ignore */ HAPTICS_MODULE)) as HapticsModule;
  } catch {
    return null;
  }
}

export async function impact(kind: ImpactKind = "light"): Promise<void> {
  if (!isBrowser()) return;

  if (isNative()) {
    const mod = await loadNativeHaptics();
    if (mod) {
      try {
        await mod.Haptics.impact({
          style: kind === "heavy" ? mod.ImpactStyle["Heavy"] : mod.ImpactStyle["Light"],
        });
        return;
      } catch {
        // نتابع للحل البديل
      }
    }
  }

  try {
    navigator.vibrate?.(kind === "heavy" ? [30, 40, 30] : 12);
  } catch {
    // بيئة لا تدعم الاهتزاز
  }
}
