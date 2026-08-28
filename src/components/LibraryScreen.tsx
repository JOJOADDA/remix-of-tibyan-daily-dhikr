import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LIBRARY } from "@/data/dhikr";
import { impact } from "@/services/haptics";

export function LibraryScreen() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      void impact("light");
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // المتصفح لا يسمح بالنسخ
    }
  };

  const handleShare = async (title: string, text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
      } else {
        await handleCopy(title, text);
      }
    } catch {
      // أُلغيت المشاركة
    }
  };

  return (
    <div className="app-screen px-safe pb-app mx-auto max-w-lg pt-12">
      <div className="mb-2 flex justify-end">
        <ThemeToggle />
      </div>
      <header className="mb-8 text-center">
        <h1 className="font-amiri text-3xl text-tibyan-green-600 dark:text-tibyan-green-emerald">
          رَوْضَةُ الأَذْكَار
        </h1>
        <p className="mt-2 text-xs text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
          صيغ الصلاة على النبي ﷺ وفضائلها المأثورة
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {LIBRARY.map((entry) => (
          <article
            key={entry.id}
            className="rounded-2xl border border-tibyan-border-light bg-tibyan-surface-light p-5 shadow-tactile dark:border-tibyan-border-dark dark:bg-tibyan-surface-dark dark:shadow-tactile-dark"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-tibyan-subtle-light dark:text-tibyan-subtle-dark">
                {entry.title}
              </h2>
              <span className="h-1 w-1 rounded-full bg-tibyan-gold" />
            </div>

            <p className="font-amiri text-xl leading-[2.2] text-tibyan-green-700 dark:text-tibyan-green-emerald">
              {entry.text}
            </p>

            <p className="mt-4 border-t border-tibyan-border-light/70 pt-3 text-[11px] leading-relaxed text-tibyan-subtle-light dark:border-tibyan-border-dark/70 dark:text-tibyan-subtle-dark">
              {entry.narration}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(entry.id, entry.text)}
                className="inline-flex items-center gap-1.5 rounded-full border border-tibyan-border-light px-3 py-1.5 text-[11px] text-tibyan-subtle-light transition-transform active:scale-95 dark:border-tibyan-border-dark dark:text-tibyan-subtle-dark"
              >
                {copiedId === entry.id ? (
                  <Check className="h-3 w-3 text-tibyan-green-emerald" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedId === entry.id ? "تم النسخ" : "نسخ"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(entry.title, entry.text)}
                className="inline-flex items-center gap-1.5 rounded-full border border-tibyan-border-light px-3 py-1.5 text-[11px] text-tibyan-subtle-light transition-transform active:scale-95 dark:border-tibyan-border-dark dark:text-tibyan-subtle-dark"
              >
                <Share2 className="h-3 w-3" />
                <span>مشاركة</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
