// تسجيل عامل الخدمة (للعمل دون إنترنت) — مع حواجز أمان لمعاينة Lovable وبيئة التطوير.
const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;

  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;

  return false;
}

async function unregisterAppWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      registrations
        .filter((registration) => {
          const url =
            registration.active?.scriptURL ??
            registration.waiting?.scriptURL ??
            registration.installing?.scriptURL ??
            "";
          return url.endsWith(SW_URL);
        })
        .map((registration) => registration.unregister()),
    );
  } catch {
    // تجاهل
  }
}

export function registerServiceWorker(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  if (isRefusedContext()) {
    void unregisterAppWorkers();
    return;
  }

  void navigator.serviceWorker.register(SW_URL, { scope: "/" }).catch(() => {
    // لا شيء: التطبيق يعمل عادياً بدون التخزين المؤقت
  });
}
