// طبقة الصوت: ملفات mp3 مُضمَّنة في التطبيق (تعمل دون إنترنت) مع بديل مُولَّد عبر Web Audio،
// إضافة إلى نطق الصلاة على النبي ﷺ عبر محرك النطق في الجهاز.

export const SALAWAT_TEXT = "اللهم صل وسلم على نبينا محمد";

export type SoundId = "salawat" | "chime" | "silent";

const FILES: Record<Exclude<SoundId, "silent">, string> = {
  salawat: "/sounds/salawat.mp3",
  chime: "/sounds/chime.mp3",
};

let ctx: AudioContext | null = null;
const players = new Map<string, HTMLAudioElement>();

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

function getPlayer(src: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let player = players.get(src);
  if (!player) {
    player = new Audio(src);
    player.preload = "auto";
    players.set(src, player);
  }
  return player;
}

/** يجب استدعاؤها داخل تفاعل المستخدم (نقرة) لفتح قناة الصوت في المتصفحات. */
export async function unlockAudio(): Promise<void> {
  const audio = getContext();
  if (audio) {
    try {
      if (audio.state === "suspended") await audio.resume();
    } catch {
      // تجاهل
    }
  }
  // تحميل الملفات مسبقاً حتى تعمل لاحقاً بدون إنترنت وبدون تفاعل
  for (const src of Object.values(FILES)) {
    const player = getPlayer(src);
    try {
      player?.load();
    } catch {
      // تجاهل
    }
  }
}

function tone(
  audio: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  gainPeak = 0.18,
) {
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

/** نغمة مُولَّدة احتياطية إن تعذّر تشغيل الملف. */
export async function playChime(): Promise<void> {
  const audio = getContext();
  if (!audio) return;
  await unlockAudio();
  const now = audio.currentTime + 0.02;
  tone(audio, 660, now, 0.7);
  tone(audio, 880, now + 0.28, 0.7);
  tone(audio, 1174, now + 0.56, 0.9, 0.12);
}

async function playFile(src: string): Promise<boolean> {
  const player = getPlayer(src);
  if (!player) return false;
  try {
    player.currentTime = 0;
    player.volume = 1;
    await player.play();
    return true;
  } catch {
    return false;
  }
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

/** تشغيل صوت التنبيه حسب الاختيار. ملف salawat.mp3 يحتوي النغمة + الصوت البشري للذكر. */
export async function playReminderSound(sound: SoundId): Promise<void> {
  if (sound === "silent") return;
  const played = await playFile(FILES[sound]);
  if (played) return;
  // بديل عند تعذّر تشغيل الملف فقط
  await playChime();
  if (sound === "salawat") {
    window.setTimeout(() => {
      speakSalawat();
    }, 1500);
  }
}

