# Remix of Tibyan: Daily Dhikr

لضبط هوية "تبيان" بالكامل داخل مشروعوثيقة متطلبات المنتج (PRD) — تطبيق تِبْيَان (Tibyan)

1. نظرة عامة على المشروع (Project Overview)

 * اسم المنتج: تِبْيَان (Tibyan)

 * الوصف: تطبيق إسلامي للهواتف الذكية يهدف إلى التذكير الدوري بالصلاة على النبي ﷺ، مع توفير مسبحة لمسية تفاعلية ومكتبة للصيغ المأثورة.

 * المنصات المستهدفة: Android (APK / AAB) و iOS عبر Capacitor.

 * النهج التصميمي: Editorial Spiritual Minimalism (ألوان ترابية وورقية دافئة، خطوط Amiri و Alexandria، واستجابة لمسية هادئة).

2. الحل المعماري لمشكلة الـ SSR وتوافق Capacitor (Critical Architecture Spec)

المشكلة التقنية

تعتمد بعض قوالب وتحديثات Lovable على أطر عمل تدعم التصيير من طرف الخادم (SSR / Next.js / Server Components)، وهو ما يتعارض جوهرياً مع Capacitor الذي يتطلب تصديراً استاتيكياً خالصاً (Single Page Application - SPA) ينتج مجلد بناء استاتيكي (مثل dist/ أو out/) يحتوي على ملف index.html وملفات الـ JS/CSS كأصول محلية (Static Assets).

الحل الإلزامي في المشروع (Build & Packaging Strategy)

 * إلزام نمط الـ Client-Side Rendering (SPA Only):

   * إذا كان المشروع مبنياً بواسطة Vite + React داخل Lovable: يتم الاعتماد على مسار الإخراج الافتراضي dist/ مع ضبط webDir: 'dist' داخل capacitor.config.ts.

   * إذا كان المشروع مبنياً باستخدام Next.js: يجب تفعيل التصدير الثابت الصريح في ملف next.config.js:

     /** @type {import('next').NextConfig} */

const nextConfig = {

  output: 'export', // يفرض توليد HTML/CSS/JS استاتيكي بدون خادم Node

  images: { unoptimized: true }, // تعطيل معالجة الصور عبر السيرفر

  trailingSlash: true,

};

module.exports = nextConfig;



     ويتم ضبط مجلد الويب في Capacitor إلى: webDir: 'out'.

 * عزل اعتمادات الـ Native APIs (Capacitor Plugins Mocking):

   * تغليف جميع دوال @capacitor/local-notifications و @capacitor/haptics داخل طبقة خدمات (Services Layer) تفحص بيئة التشغيل (Capacitor.isNativePlatform()) لمنع توقف التطبيق أو حدوث أخطاء Hydration أثناء المعاينة على الويب في Lovable.

3. الميزات الوظيفية الأساسية (Core Features)

3.1. نظام التنبيهات والعمل في الخلفية (Background Engine)

 * الجدولة الدقيقة: جدولة التنبيهات عبر نظام أندرويد (AlarmManager) باستخدام @capacitor/local-notifications.

 * الفواصل الزمنية: (كل 5، 15، 30، 60، 120 دقيقة).

 * قنوات الصوت المخصصة (Notification Channels): تشغيل ملفات صوتية مخصصة (salawat.wav) مخزنة محلياً في android/app/src/main/res/raw/.

 * العمل دون اتصال (100% Offline): التطبيق لا يحتاج لأي اتصال بالإنترنت بعد تثبيته.

3.2. المسبحة التفاعلية (Tactile Halo Counter)

 * النقر على كامل الشاشة (Tap-Anywhere): إمكانية العد باللمس في أي مكان دون الحاجة للنظر إلى موضع محدد.

 * الاستجابة اللمسية (Haptic Engine):

   * نبضة خفيفة (Light Impact) مع كل تسبيحة.

   * نبضة مزدوجة ثقيلة (Heavy Impact) عند إتمام الدورة (33 / 100).

 * حلقة التقدم الرفيعة (Minimalist SVG Ring): مؤشر بصري ذهبي (#C29B38) يتتبع مسار الهدف المختار.

3.3. مكتبة الصيغ وفضائل الذكر (The Sanctuary / الروضة)

 * عرض الصيغ المأثورة (الصيغة الإبراهيمية، الصيغ الموجزة) مع أحاديث الفضل.

 * أدوات سريعة لنسخ النص ومشاركته كبطاقة نصية.

4. المكدس التقني (Tech Stack)

| الطبقة | التقنية المستخدمة | الوظيفة |

|---|---|---|

| Frontend Framework | React 18+ (Vite SPA / Next.js Static Export) | بناء واجهة المستخدم |

| Styling | Tailwind CSS + Typography Tokens | ضبط ألوان tibyan والخطوط |

| Mobile Runtime | Capacitor 6+ | تغليف التطبيق كـ Android APK |

| Native Plugins | @capacitor/local-notifications, @capacitor/haptics | إدارة التنبيهات والاهتزاز |

| Typography | Amiri (النصوص والذكر), Alexandria (الواجهة والأرقام) | تيبوغرافيا إسلامية حديثة |

| Local Storage | localStorage / Capacitor Preferences | حفظ الإعدادات وإجمالي العدادات |

5. هيكلية الملفات المقترحة (Architecture Blueprint)

tibyan/

├── android/                        # مشروع أندرويد الأصلي (Capacitor)

│   └── app/src/main/res/raw/       # ملفات الصوت (salawat1.wav)

├── public/

│   └── sounds/                     # ملفات الصوت لمعاينة الويب

├── src/

│   ├── components/

│   │   ├── HomeScreen.tsx          # شاشة المسبحة وحلقة التقدم

│   │   ├── ReminderSettings.tsx    # شاشة جدولة وضبط التنبيهات

│   │   ├── SoundSelector.tsx       # مكون اختيار ومعاينة النغمات

│   │   ├── LibraryScreen.tsx       # مكتبة الصيغ والفضائل

│   │   └── BottomNav.tsx           # شريط التنقل السفلي العائم

│   ├── services/

│   │   ├── notifications.ts        # منطق وقنوات الإشعارات

│   │   └── haptics.ts              # منطق الاهتزاز اللمسي

│   ├── index.css                   # إعدادات الخطوط واتجاه RTL

│   └── App.tsx                     # إدارة التنقل والحالة العامة

├── capacitor.config.ts             # إعدادات الحزمة و webDir

└── tailwind.config.js              # لوحة ألوان tibyan وخطوط Google



6. متطلبات أذونات النظام (Android Manifest Requirements)

يجب تضمين الأذونات التالية في ملف AndroidManifest.xml:

<!-- أذونات التنبيهات والجدولة في الخلفية -->

<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>

<uses-permission android:name="android.permission.USE_EXACT_ALARM"/>

<uses-permission android:name="android.permission.VIBRATE"/>

<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>



7. مراحل الإطلاق وخطة العمل (Milestones)

 * المرحلة 1 (الواجهة وتجربة المستخدم): إنهاء شاشات المسبحة، الإعدادات، والروضة مع دعم الوضعين الليلي والنهاري داخل Lovable.

 * المرحلة 2 (تأكيد التصدير الاستاتيكي): تشغيل أمر البناء (npm run build) والتأكد من إنتاج index.html في مجلد الإخراج (dist أو out).

 * المرحلة 3 (مزامنة Capacitor): تنفيذ npx cap sync android، وإضافة ملفات الصوت إلى res/raw.

 * المرحلة 4 (الاختبار والتجميع): اختبار دقة مواعيد الإشعارات عند إغلاق التطبيق كلياً، وتوليد ملف app-release.apk.

 React / Lovable ومنع توليد الألوان والخطوط الافتراضية، يتم ضبط الإعدادات على 3 خطوات أساسية:

1. استدعاء الخطوط في ملف index.html

أضف روابط خطوط Amiri (للنصوص والآيات) و Alexandria (لعناصر الواجهة والأرقام) داخل وسم <head> في ملف index.html:

<link rel="preconnect" href="https://fonts.googleapis.com">

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">



2. ضبط ملف tailwind.config.js أو tailwind.config.ts

استبدل إعدادات الألوان والخطوط داخل ملف الإعداد بما يلي:

/** @type {import('tailwindcss').Config} */

export default {

  darkMode: 'class',

  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {

    extend: {

      fontFamily: {

        // خط النصوص الروحية والذكر

        amiri: ['Amiri', 'serif'],

        // خط الواجهة والأرقام وعناصر التحكم

        sans: ['Alexandria', 'sans-serif'],

      },

      colors: {

        tibyan: {

          // الوضع النهاري (ورق كتان دافئ)

          canvas: {

            light: '#FAF7F2',

            dark: '#0B1310',

          },

          // الأسطح والبطاقات

          surface: {

            light: '#FFFFFF',

            dark: '#121C18',

          },

          // النصوص الأساسية

          ink: {

            light: '#1F2421',

            dark: '#EDE8DF',

          },

          // النصوص الثانوية والتفاصيل الهادئة

          subtle: {

            light: '#6E7771',

            dark: '#8E9B93',

          },

          // الأخضر العميق (Primary)

          green: {

            50: '#F2F7F4',

            100: '#E1EFE7',

            500: '#2D5A46',

            600: '#1B4D3E', // اللون الأساسي النهاري

            700: '#143C30',

            800: '#0E2921',

            900: '#071813',

            emerald: '#4E9B7D', // اللون الأساسي الليلي

          },

          // الذهب الأندلسي المطفأ (Accent)

          gold: {

            light: '#E8D39E',

            DEFAULT: '#C29B38',

            dark: '#8F6F20',

          },

          // حدود العناصر

          border: {

            light: '#EBE5DA',

            dark: '#1D2E27',

          }

        },

      },

      boxShadow: {

        'tactile': '0 2px 8px -2px rgba(31, 36, 33, 0.04), 0 1px 4px -1px rgba(31, 36, 33, 0.02)',

        'tactile-dark': '0 4px 12px -2px rgba(0, 0, 0, 0.3)',

      },

    },

  },

  plugins: [],

};



3. إعداد الأساسيات في ملف src/index.css

اضبط اتجاه الصفحة للغة العربية وطبّق الخط والألوان الافتراضية على وسم body:

@tailwind base;

@tailwind components;

@tailwind utilities;



@layer base {

  html {

    direction: rtl;

    font-family: 'Alexandria', sans-serif;

    -webkit-tap-highlight-color: transparent;

  }



  body {

    @apply bg-tibyan-canvas-light text-tibyan-ink-light dark:bg-tibyan-canvas-dark dark:text-tibyan-ink-dark transition-colors duration-300;

  }

}



أمثلة لكيفية استخدام هذه الكلاسات في مكوناتك:

 * لنص الصلاة على النبي أو الأحاديث:

   <p className="font-amiri text-2xl leading-[2.2] text-tibyan-green-600 dark:text-tibyan-green-emerald">

  اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ

</p>



 * للبطاقات والأزرار الملموسة:

   <div className="bg-tibyan-surface-light dark:bg-tibyan-surface-dark border border-tibyan-border-light dark:border-tibyan-border-dark shadow-tactile dark:shadow-tactile-dark rounded-2xl p-5">

  {/* المحتوى */}

</div>



إليك كود الشاشة الرئيسية للمسبحة التفاعلية لتطبيق "تبيان" (HomeScreen.tsx) مع تطبيق فلسفة Editorial Spiritual Minimalism، دعم النقر على كامل الشاشة، الاهتزاز اللمسي (Haptic Feedback) عبر Capacitor، واستخدام متغيرات ألوان وخطوط tibyan.

تثبيت حزمة الاهتزاز اللمسي (Haptics)

npm install @capacitor/haptics

npx cap sync



كود الشاشة الرئيسية (src/components/HomeScreen.tsx)

import React, { useState, useEffect, useCallback } from 'react';

import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';



const DHIKR_LIST = [

  {

    id: 'salawat_short',

    text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',

    target: 33,

    virtue: 'من صلى عليّ صلاة صلى الله عليه بها عشراً',

  },

  {

    id: 'salawat_ibrahimiyyah',

    text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ',

    target: 100,

    virtue: 'أكمل صيغ الصلاة على النبي ﷺ وأفضلها',

  },

  {

    id: 'tasbih',

    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',

    target: 33,

    virtue: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان',

  },

];



export const HomeScreen: React.FC = () => {

  const [activeDhikrIndex, setActiveDhikrIndex] = useState(0);

  const [count, setCount] = useState(() => {

    const saved = localStorage.getItem('tibyan_current_count');

    return saved ? parseInt(saved, 10) : 0;

  });

  const [totalCount, setTotalCount] = useState(() => {

    const saved = localStorage.getItem('tibyan_total_count');

    return saved ? parseInt(saved, 10) : 0;

  });

  const [hapticEnabled, setHapticEnabled] = useState(true);

  const [isPressed, setIsPressed] = useState(false);



  const currentDhikr = DHIKR_LIST[activeDhikrIndex];

  const progressPercent = Math.min((count / currentDhikr.target) * 100, 100);



  // حفظ العدادات محلياً

  useEffect(() => {

    localStorage.setItem('tibyan_current_count', count.toString());

    localStorage.setItem('tibyan_total_count', totalCount.toString());

  }, [count, totalCount]);



  // إطلاق الاهتزاز اللمسي الفيزيائي

  const triggerHaptic = useCallback(async (isTargetReached: boolean) => {

    if (!hapticEnabled) return;

    try {

      if (isTargetReached) {

        // نبضة مزدوجة/ثقيلة عند إتمام الدورة

        await Haptics.impact({ style: ImpactStyle.Heavy });

      } else {

        // نبضة خفيفة ناعمة مع كل تسبيحة

        await Haptics.impact({ style: ImpactStyle.Light });

      }

    } catch {

      // Fallback للمتصفح إذا لم يكن يعمل على هاتف

    }

  }, [hapticEnabled]);



  // الضغط للتسبيح (Tap Anywhere)

  const handleScreenTap = () => {

    setIsPressed(true);

    setTimeout(() => setIsPressed(false), 120);



    const nextCount = count + 1;

    const reachedTarget = nextCount % currentDhikr.target === 0;



    triggerHaptic(reachedTarget);

    setCount(nextCount);

    setTotalCount((prev) => prev + 1);

  };



  const handleReset = (e: React.MouseEvent) => {

    e.stopPropagation();

    setCount(0);

    triggerHaptic(false);

  };



  const toggleDhikr = (e: React.MouseEvent) => {

    e.stopPropagation();

    setActiveDhikrIndex((prev) => (prev + 1) % DHIKR_LIST.length);

    setCount(0);

  };



  return (

    <div

      onClick={handleScreenTap}

      className="relative min-h-screen w-full select-none cursor-pointer flex flex-col justify-between p-6 overflow-hidden bg-tibyan-canvas-light dark:bg-tibyan-canvas-dark transition-colors duration-500 font-sans"

    >

      {/* الترويسة العلوية */}

      <header className="flex items-center justify-between z-10 pt-2">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-xl bg-tibyan-green-600/10 dark:bg-tibyan-green-emerald/10 border border-tibyan-green-600/20 dark:border-tibyan-green-emerald/20 flex items-center justify-center">

            <span className="font-amiri text-lg font-bold text-tibyan-green-600 dark:text-tibyan-green-emerald">

              ت

            </span>

          </div>

          <span className="text-sm font-semibold tracking-wider text-tibyan-ink-light dark:text-tibyan-ink-dark">

            تِبْيَان

          </span>

        </div>



        {/* أدوات التحكم السريعة */}

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>

          <button

            onClick={() => setHapticEnabled(!hapticEnabled)}

            className="p-2.5 rounded-full bg-tibyan-surface-light dark:bg-tibyan-surface-dark border border-tibyan-border-light dark:border-tibyan-border-dark text-tibyan-subtle-light dark:text-tibyan-subtle-dark shadow-tactile dark:shadow-tactile-dark active:scale-90 transition-transform"

            title="الاهتزاز اللمسي"

          >

            {hapticEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}

          </button>



          <button

            onClick={handleReset}

            className="p-2.5 rounded-full bg-tibyan-surface-light dark:bg-tibyan-surface-dark border border-tibyan-border-light dark:border-tibyan-border-dark text-tibyan-subtle-light dark:text-tibyan-subtle-dark shadow-tactile dark:shadow-tactile-dark active:scale-90 transition-transform"

            title="إعادة ضبط العداد"

          >

            <RotateCcw className="w-4 h-4" />

          </button>

        </div>

      </header>



      {/* منطقة الذكر المركزية والعداد بأسلوب المحراب */}

      <main className="flex-1 flex flex-col items-center justify-center my-auto z-10 text-center max-w-lg mx-auto">

        {/* زر تبديل الصيغة */}

        <button

          onClick={toggleDhikr}

          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tibyan-green-50 dark:bg-tibyan-surface-dark border border-tibyan-green-100 dark:border-tibyan-border-dark text-[11px] font-medium text-tibyan-green-600 dark:text-tibyan-green-emerald mb-6 transition-transform active:scale-95"

        >

          <Sparkles className="w-3 h-3 text-tibyan-gold" />

          <span>تغيير الصيغة</span>

        </button>



        {/* نص الذكر والصلاة على النبي */}

        <div className="min-h-[110px] flex items-center justify-center px-4 mb-8">

          <p className="font-amiri text-2xl md:text-3xl leading-[2.3] text-tibyan-green-700 dark:text-tibyan-green-emerald drop-shadow-sm transition-all duration-300">

            {currentDhikr.text}

          </p>

        </div>



        {/* حلقة العداد اللمسية الدائرية (Minimalist Halo Counter) */}

        <div className="relative flex items-center justify-center w-64 h-64 my-2">

          {/* SVG Progress Ring */}

          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">

            {/* الدائرة الخلفية */}

            <circle

              cx="50"

              cy="50"

              r="44"

              className="text-tibyan-border-light dark:text-tibyan-border-dark"

              strokeWidth="2"

              stroke="currentColor"

              fill="transparent"

            />

            {/* دائرة التقدم الذهبية المطفأة */}

            <circle

              cx="50"

              cy="50"

              r="44"

              className="text-tibyan-gold transition-all duration-300 ease-out"

              strokeWidth="2.5"

              strokeDasharray={276.46}

              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}

              strokeLinecap="round"

              stroke="currentColor"

              fill="transparent"

            />

          </svg>



          {/* محتوى العداد في المنتصف */}

          <div

            className={`absolute flex flex-col items-center justify-center transition-transform duration-100 ${

              isPressed ? 'scale-95' : 'scale-100'

            }`}

          >

            <span className="text-6xl font-light tracking-tighter text-tibyan-ink-light dark:text-tibyan-ink-dark font-sans">

              {count}

            </span>

            <span className="text-xs text-tibyan-subtle-light dark:text-tibyan-subtle-dark mt-1 font-medium">

              الهدف: {currentDhikr.target}

            </span>

          </div>

        </div>



        {/* فضل الذكر الحالي */}

        <p className="text-xs text-tibyan-subtle-light dark:text-tibyan-subtle-dark max-w-xs mt-6 leading-relaxed">

          {currentDhikr.virtue}

        </p>

      </main>



      {/* التذييل السفلي: إجمالي التسبيحات والتوجيه */}

      <footer className="z-10 flex items-center justify-between border-t border-tibyan-border-light/60 dark:border-tibyan-border-dark/60 pt-4 text-xs">

        <div className="flex flex-col">

          <span className="text-[10px] text-tibyan-subtle-light dark:text-tibyan-subtle-dark">

            مجموع الصلوات اليوم

          </span>

          <span className="text-sm font-semibold text-tibyan-ink-light dark:text-tibyan-ink-dark">

            {totalCount}

          </span>

        </div>



        <span className="text-[11px] text-tibyan-subtle-light/70 dark:text-tibyan-subtle-dark/70">

          المس في أي مكان للتسبيح

        </span>

      </footer>

    </div>

  );

};



مميزات الشاشة:

 * Tap-Anywhere Experience: الشاشة كاملة تعمل كزر تسبيح دون الحاجة للنظر إلى موضع محدد.

 * SVG Thin Halo: حلقة تقدم ناعمة (2.5px) بلون الذهب المطفأ tibyan-gold تحسب الوصول للهدف (33 أو 100).

 * دعم الخطوط: دمج خط Amiri للذكر و Alexandria للأرقام والنصوص التوضيحية لضمان الهوية البصرية.

إليك كود شريط التنقل السفلي العائم (BottomNav.tsx) بأسلوب Editorial Spiritual Minimalism، مع دعم تأثير الزجاج المطفأ (backdrop-blur)، حركات تفاعلية ناعمة، واستخدام كامل لمتغيرات هوية تبيان.

كود شريط التنقل السفلي (src/components/BottomNav.tsx)

import React from 'react';

import { Compass, BookOpen, Settings, Heart } from 'lucide-react';



export type TabType = 'counter' | 'library' | 'settings';



interface BottomNavProps {

  activeTab: TabType;

  onTabChange: (tab: TabType) => void;

}



interface NavItem {

  id: TabType;

  label: string;

  icon: React.FC<{ className?: string }>;

}



const NAV_ITEMS: NavItem[] = [

  { id: 'counter', label: 'المسبحة', icon: Compass },

  { id: 'library', label: 'الروضة', icon: BookOpen },

  { id: 'settings', label: 'التنبيهات', icon: Settings },

];



export const BottomNav: React.FC<BottomNavProps> = ({

  activeTab,

  onTabChange,

}) => {

  return (

    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none font-sans">

      <nav

        dir="rtl"

        className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full bg-tibyan-surface-light/85 dark:bg-tibyan-surface-dark/85 backdrop-blur-md border border-tibyan-border-light/80 dark:border-tibyan-border-dark/80 shadow-tactile dark:shadow-tactile-dark transition-all duration-300"

      >

        {NAV_ITEMS.map((item) => {

          const Icon = item.icon;

          const isActive = activeTab === item.id;



          return (

            <button

              key={item.id}

              onClick={() => onTabChange(item.id)}

              type="button"

              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-300 ease-out select-none active:scale-95 ${

                isActive

                  ? 'bg-tibyan-green-600 dark:bg-tibyan-green-700 text-tibyan-ink-dark shadow-sm'

                  : 'text-tibyan-subtle-light dark:text-tibyan-subtle-dark hover:text-tibyan-ink-light dark:hover:text-tibyan-ink-dark'

              }`}

            >

              <Icon

                className={`w-4 h-4 transition-transform duration-300 ${

                  isActive ? 'scale-110' : 'scale-100'

                }`}

              />

              

              <span

                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${

                  isActive ? 'max-w-20 opacity-100 font-semibold' : 'max-w-0 opacity-0'

                }`}

              >

                {item.label}

              </span>



              {/* نقطة ذهبية هادئة للإشارة للتحديد */}

              {isActive && (

                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-tibyan-gold" />

              )}

            </button>

          );

        })}

      </nav>

    </div>

  );

};



دمج الشريط مع الشاشة الرئيسية وإدارة التبويبات (src/App.tsx)

import React, { useState } from 'react';

import { HomeScreen } from './components/HomeScreen';

import { ReminderSettings } from './components/ReminderSettings';

import { BottomNav, TabType } from './components/BottomNav';



export default function App() {

  const [activeTab, setActiveTab] = useState<TabType>('counter');



  return (

    <div className="relative min-h-screen bg-tibyan-canvas-light dark:bg-tibyan-canvas-dark text-tibyan-ink-light dark:text-tibyan-ink-dark">

      {/* عرض الشاشة المحددة */}

      <main className="pb-24">

        {activeTab === 'counter' && <HomeScreen />}

        {activeTab === 'library' && (

          <div className="p-6 text-center max-w-md mx-auto pt-20">

            <h2 className="font-amiri text-2xl text-tibyan-green-600 dark:text-tibyan-green-emerald mb-2">

              رَوْضَةُ الأَذْكَار

            </h2>

            <p className="text-xs text-tibyan-subtle-light dark:text-tibyan-subtle-dark">

              مكتبة صيغ وفضائل الصلاة على النبي ﷺ (قيد التجهيز)

            </p>

          </div>

        )}

        {activeTab === 'settings' && (

          <div className="p-4 pt-12">

            <ReminderSettings />

          </div>

        )}

      </main>



      {/* الشريط السفلي العائم */}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

    </div>

  );

}



من تطوير مجاهد ادم

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8cef042b-d026-4ec3-b2ef-581acef82230).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
