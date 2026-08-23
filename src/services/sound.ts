// طبقة الصوت: نغمة مُولَّدة عبر Web Audio + نطق الصلاة على النبي ﷺ عبر محرك النطق في المتصفح.
// لا تحتاج ملفات mp3 خارجية، وتعمل دون اتصال بالإنترنت.

export const SALAWAT_TEXT = "اللهم صل وسلم على نبينا محمد";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

/** يجب استدعاؤها داخل تفاعل المستخدم (نقرة) لفتح قناة الصوت في المتصفحات. */
export async function unlockAudio(): Promise<void> {
  const audio = getContext();
  if (!audio) return;
  try {
    if (audio.state === "suspended") await audio.resume();
  } catch {
    // تجاهل
  }
}

function tone(audio: AudioContext, freq: number, startAt: number, duration: number, gainPeak = 0.18) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startAt + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/** نغمة ندى هادئة (ثلاث نبرات متدرجة). */
export async function playChime(): Promise<void> {
  const audio = getContext();
  if (!audio) return;
  await unlockAudio();
  const now = audio.currentTime + 0.02;
  tone(audio, 660, now, 0.7);
  tone(audio, 880, now + 0.28, 0.7);
  tone(audio, 1174, now + 0.56, 0.9, 0.12);
}

/** نطق «اللهم صل وسلم على نبينا محمد» بصوت عربي إن توفر. */
export function speakSalawat(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(SALAWAT_TEXT);
    utter.lang = "ar-SA";
    utter.rate = 0.85;
    utter.pitch = 1;
    const arabic = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith("ar"));
    if (arabic) utter.voice = arabic;
    synth.speak(utter);
    return true;
  } catch {
    return false;
  }
}

export type SoundId = "salawat" | "chime" | "silent";

/** تشغيل صوت التنبيه حسب الاختيار. */
export async function playReminderSound(sound: SoundId): Promise<void> {
  if (sound === "silent") return;
  await playChime();
  if (sound === "salawat") {
    window.setTimeout(() => {
      speakSalawat();
    }, 1200);
  }
}
