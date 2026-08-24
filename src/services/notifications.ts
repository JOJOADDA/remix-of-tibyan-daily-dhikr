import { playReminderSound, unlockAudio, type SoundId } from "./sound";

// طبقة التنبيهات: تستخدم Capacitor Local Notifications على الجهاز، وWeb Notifications في المعاينة.
export const INTERVALS = [5, 15, 30, 60, 120] as const;
export type IntervalMinutes = (typeof INTERVALS)[number];

const NOTIFICATIONS_MODULE = "@capacitor/local-notifications";

interface LocalNotificationsModule {
  LocalNotifications: {
    requestPermissions: () => Promise<unknown>;
    schedule: (options: unknown) => Promise<unknown>;
    cancel: (options: unknown) => Promise<unknown>;
  };
}

const isBrowser = () => typeof window !== "undefined";

function isNative(): boolean {
  if (!isBrowser()) return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

async function loadNative(): Promise<LocalNotificationsModule | null> {
  try {
    return (await import(/* @vite-ignore */ NOTIFICATIONS_MODULE)) as LocalNotificationsModule;
  } catch {
    return null;
  }
}

export async function requestPermission(): Promise<boolean> {
  if (!isBrowser()) return false;
  if (isNative()) return true;
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

let webTimer: ReturnType<typeof setInterval> | undefined;

export interface ScheduleOptions {
  minutes: IntervalMinutes;
  body: string;
  sound?: string | undefined;
  /** معرّف الصوت للتشغيل في المتصفح: salawat | chime | silent */
  soundId?: SoundId;
}

export async function schedule(options: ScheduleOptions): Promise<void> {
  if (!isBrowser()) return;
  await cancelAll();
  const soundId: SoundId = options.soundId ?? "salawat";

  if (isNative()) {
    const mod = await loadNative();
    if (mod) {
      try {
        await mod.LocalNotifications.requestPermissions();
        await mod.LocalNotifications.schedule({
          notifications: [
            {
              id: 1,
              title: "تِبْيَان",
              body: options.body,
              sound: options.sound ?? "salawat.mp3",
              channelId: "tibyan_salawat",
              schedule: {
                every: "minute",
                count: options.minutes,
                repeats: true,
                allowWhileIdle: true,
              },
            },
          ],
        });
        return;
      } catch {
        // fallback للويب
      }
    }
  }

  // في المتصفح: نفتح قناة الصوت الآن (نحن داخل تفاعل المستخدم) ثم نُشغّل الصوت مع كل تذكير
  await unlockAudio();
  const granted = await requestPermission();
  webTimer = setInterval(
    () => {
      void playReminderSound(soundId);
      if (granted) {
        try {
          new Notification("تِبْيَان", { body: options.body });
        } catch {
          // تم إغلاق الصلاحية
        }
      }
    },
    options.minutes * 60 * 1000,
  );
}


export async function cancelAll(): Promise<void> {
  if (webTimer) {
    clearInterval(webTimer);
    webTimer = undefined;
  }
  if (!isNative()) return;
  const mod = await loadNative();
  try {
    await mod?.LocalNotifications.cancel({ notifications: [{ id: 1 }] });
  } catch {
    // لا شيء
  }
}
