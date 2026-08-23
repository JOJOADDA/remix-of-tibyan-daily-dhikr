import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomNav, type TabType } from "@/components/BottomNav";
import { HomeScreen } from "@/components/HomeScreen";
import { LibraryScreen } from "@/components/LibraryScreen";
import { ReminderSettings } from "@/components/ReminderSettings";

export const Route = createFileRoute("/")({
  component: TibyanApp,
  head: () => ({
    meta: [
      { title: "تِبْيَان — تذكير بالصلاة على النبي ﷺ ومسبحة لمسية" },
      {
        name: "description",
        content:
          "تِبْيَان تطبيق إسلامي للتذكير الدوري بالصلاة على النبي ﷺ مع مسبحة لمسية تفاعلية ومكتبة للصيغ المأثورة، يعمل دون اتصال بالإنترنت.",
      },
      { property: "og:title", content: "تِبْيَان — الصلاة على النبي ﷺ" },
      {
        property: "og:description",
        content: "مسبحة لمسية، تنبيهات دورية، وروضة لصيغ الصلاة على النبي ﷺ وفضائلها.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function TibyanApp() {
  const [activeTab, setActiveTab] = useState<TabType>("counter");

  // احترام الوضع الليلي لنظام المستخدم
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return (
    <div className="relative min-h-screen bg-tibyan-canvas-light text-tibyan-ink-light transition-colors duration-300 dark:bg-tibyan-canvas-dark dark:text-tibyan-ink-dark">
      <main>
        {activeTab === "counter" && <HomeScreen />}
        {activeTab === "library" && <LibraryScreen />}
        {activeTab === "settings" && <ReminderSettings />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
