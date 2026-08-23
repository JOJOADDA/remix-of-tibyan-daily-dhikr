import type { CapacitorConfig } from "@capacitor/cli";

// إعداد Capacitor لتغليف التطبيق كتطبيق أندرويد (APK) يعمل دون إنترنت.
// خطوات البناء موجودة في ANDROID.md
const config: CapacitorConfig = {
  appId: "app.lovable.tibyan",
  appName: "تِبْيَان",
  // مجلد الملفات الثابتة الناتج عن `npm run build`
  webDir: ".output/public",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#0a5c3f",
      sound: "salawat.wav",
    },
  },
};

export default config;
