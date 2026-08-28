import { BellRing, BellOff, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { INTERVALS, cancelAll, schedule, type IntervalMinutes } from "@/services/notifications";
import { impact } from "@/services/haptics";
import { playReminderSound, unlockAudio, type SoundId } from "@/services/sound";
import { ThemeToggle } from "@/components/ThemeToggle";

const SOUNDS = [
  { id: "salawat", label: "بصوت الشيخ مشاري العفاسي: اللهم صل وسلم على نبينا محمد" },
  { id: "chime", label: "نغمة ندى" },
  { id: "silent", label: "بدون صوت" },
];

export function ReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [minutes, setMinutes] = useState<IntervalMinutes>(30);
  const [sound, setSound] = useState("salawat");

  useEffect(() => {
    const savedEnabled = window.localStorage.getItem("tibyan_reminders_enabled") === "1";
    const savedMinutes = Number(window.localStorage.getItem("tibyan_reminders_minutes"));
    const savedSound = window.localStorage.getItem("tibyan_reminders_sound");
    setEnabled(savedEnabled);
    if (INTERVALS.includes(savedMinutes as IntervalMinutes)) {
      setMinutes(savedMinutes as IntervalMinutes);
    }
    if (savedSound) setSound(savedSound);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tibyan_reminders_enabled", enabled ? "1" : "0");
    window.localStorage.setItem("tibyan_reminders_minutes", String(minutes));
    window.localStorage.setItem("tibyan_reminders_sound", sound);
  }, [enabled, minutes, sound]);

  const apply = async (nextEnabled: boolean, nextMinutes: IntervalMinutes) => {
    void impact("light");
    await unlockAudio();
    if (nextEnabled) {
      await schedule({
        minutes: nextMinutes,
        body: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
        sound: sound === "silent" ? undefined : `${sound}.mp3`,
        soundId: sound as SoundId,
      });
    } else {
      await cancelAll();
    }
  };

  return (
    <div className="app-screen px-safe pb-app mx-auto max-w-lg pt-12">
      <div className="mb-2 flex justify-end">
        <ThemeToggle />
      </div>
      <header className="mb-8 text-center">
        <h1 className="font-amiri text-3xl text-tibyan-green-600 dark:text-tibyan-green-emerald">
          تَنْبِيهَاتُ الذِّكْر
        </h1>
        <p className="mt-2 text-xs text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
          تذكير دوري بالصلاة على النبي ﷺ يعمل دون اتصال بالإنترنت
        </p>
      </header>

      <section className="mb-4 rounded-2xl border border-tibyan-border-light bg-tibyan-surface-light p-5 shadow-tactile dark:border-tibyan-border-dark dark:bg-tibyan-surface-dark dark:shadow-tactile-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled ? (
              <BellRing className="h-4 w-4 text-tibyan-green-600 dark:text-tibyan-green-emerald" />
            ) : (
              <BellOff className="h-4 w-4 text-tibyan-subtle-light dark:text-tibyan-subtle-dark" />
            )}
            <div>
              <p className="text-sm font-semibold text-tibyan-ink-light dark:text-tibyan-ink-dark">
                تشغيل التذكير
              </p>
              <p className="text-[11px] text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
                {enabled ? `كل ${minutes} دقيقة` : "التذكير متوقف حالياً"}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              void apply(next, minutes);
            }}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              enabled
                ? "bg-tibyan-green-600 dark:bg-tibyan-green-emerald"
                : "bg-tibyan-border-light dark:bg-tibyan-border-dark"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-tibyan-surface-light shadow-sm transition-all ${
                enabled ? "right-0.5" : "right-[22px]"
              }`}
            />
          </button>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-tibyan-border-light bg-tibyan-surface-light p-5 shadow-tactile dark:border-tibyan-border-dark dark:bg-tibyan-surface-dark dark:shadow-tactile-dark">
        <p className="mb-4 text-xs font-semibold text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
          الفاصل الزمني
        </p>
        <div className="flex flex-wrap gap-2">
          {INTERVALS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMinutes(value);
                if (enabled) void apply(true, value);
                else void impact("light");
              }}
              className={`rounded-full border px-4 py-2 text-xs transition-transform active:scale-95 ${
                minutes === value
                  ? "border-tibyan-green-600 bg-tibyan-green-600 text-tibyan-ink-dark dark:border-tibyan-green-emerald dark:bg-tibyan-green-700"
                  : "border-tibyan-border-light text-tibyan-subtle-light dark:border-tibyan-border-dark dark:text-tibyan-subtle-dark"
              }`}
            >
              {value} دقيقة
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-tibyan-border-light bg-tibyan-surface-light p-5 shadow-tactile dark:border-tibyan-border-dark dark:bg-tibyan-surface-dark dark:shadow-tactile-dark">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
          <Volume2 className="h-3.5 w-3.5" />
          نغمة التنبيه
        </p>
        <div className="flex flex-col gap-2">
          {SOUNDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSound(item.id);
                void impact("light");
                void playReminderSound(item.id as SoundId);
                if (enabled) void apply(true, minutes);
              }}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs transition-transform active:scale-[0.98] ${
                sound === item.id
                  ? "border-tibyan-gold/60 bg-tibyan-gold/10 text-tibyan-ink-light dark:text-tibyan-ink-dark"
                  : "border-tibyan-border-light text-tibyan-subtle-light dark:border-tibyan-border-dark dark:text-tibyan-subtle-dark"
              }`}
            >
              <span>{item.label}</span>
              {sound === item.id && <span className="h-1.5 w-1.5 rounded-full bg-tibyan-gold" />}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            void impact("light");
            void playReminderSound(sound as SoundId);
          }}
          className="mt-4 w-full rounded-xl border border-tibyan-green-600/50 py-3 text-xs font-semibold text-tibyan-green-600 transition-transform active:scale-[0.98] dark:border-tibyan-green-emerald/50 dark:text-tibyan-green-emerald"
        >
          تجربة الصوت الآن
        </button>
      </section>

      <p className="mt-6 text-center text-[10px] leading-relaxed text-tibyan-subtle-light/80 dark:text-tibyan-subtle-dark/80">
        الصوت مُضمَّن داخل التطبيق ويعمل دون إنترنت. على أندرويد تُجدول التنبيهات عبر نظام التشغيل.
      </p>
    </div>
  );
}
