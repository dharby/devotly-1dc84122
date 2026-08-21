import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Sun, Moon, Monitor, Type, Globe, Bell, LogOut, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getSettings, updateSettings, BIBLE_TRANSLATIONS, type AppSettings, type BibleTranslation } from "@/lib/settingsStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { requestNotificationPermission, scheduleReminder, cancelReminder, showNotification, notificationsSupported, type ReminderKind } from "@/lib/notifications";

const themes = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

const fonts = [
  { value: "serif" as const, label: "Serif", preview: "font-serif" },
  { value: "sans" as const, label: "Sans", preview: "font-sans" },
  { value: "mono" as const, label: "Mono", preview: "font-mono" },
];

const fontSizes = [
  { value: "sm" as const, label: "Small" },
  { value: "md" as const, label: "Medium" },
  { value: "lg" as const, label: "Large" },
  { value: "xl" as const, label: "Extra Large" },
];

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸", disabled: true },
  { value: "fr", label: "Français", flag: "🇫🇷", disabled: true },
  { value: "pt", label: "Português", flag: "🇧🇷", disabled: true },
  { value: "yo", label: "Yorùbá", flag: "🇳🇬", disabled: true },
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const update = (partial: Partial<AppSettings>) => {
    const updated = updateSettings(partial);
    setSettings(updated);
  };

  const REMINDERS: { kind: ReminderKind; label: string; hint: string; enabledKey: keyof AppSettings; timeKey: keyof AppSettings }[] = [
    { kind: "devotion", label: "Time for devotion", hint: "A nudge to sit down with today's devotional.", enabledKey: "dailyReminderEnabled", timeKey: "dailyReminderTime" },
    { kind: "word", label: "Word of the Day", hint: "A single word to meditate on through the day.", enabledKey: "wordOfDayEnabled", timeKey: "wordOfDayTime" },
    { kind: "scripture", label: "Scripture of the Day", hint: "A verse delivered to your notification centre.", enabledKey: "scriptureOfDayEnabled", timeKey: "scriptureOfDayTime" },
  ];

  const toggleReminder = async (r: typeof REMINDERS[number], checked: boolean) => {
    if (checked) {
      if (!notificationsSupported()) { toast.error("Notifications not supported on this device"); return; }
      const perm = await requestNotificationPermission();
      if (perm !== "granted") { toast.error("Please allow notifications in your browser"); return; }
      const time = settings[r.timeKey] as string;
      update({ [r.enabledKey]: true } as Partial<AppSettings>);
      scheduleReminder(r.kind, time);
      toast.success(`${r.label} set for ${time}`);
    } else {
      update({ [r.enabledKey]: false } as Partial<AppSettings>);
      cancelReminder(r.kind);
    }
  };

  const changeReminderTime = (r: typeof REMINDERS[number], time: string) => {
    update({ [r.timeKey]: time } as Partial<AppSettings>);
    if (settings[r.enabledKey]) scheduleReminder(r.kind, time);
  };

  const sendTest = async () => {
    const perm = await requestNotificationPermission();
    if (perm !== "granted") { toast.error("Enable notifications first"); return; }
    await showNotification("Devotly · Test 🔔", "Notifications are working. Peace be with you.");
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="px-6 pt-6 space-y-8">
        {/* Theme */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary" /> Appearance
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => update({ theme: t.value })}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all",
                  settings.theme === t.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Font Family */}
        <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
            <Type className="h-4 w-4 text-primary" /> Font Style
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {fonts.map((f) => (
              <button
                key={f.value}
                onClick={() => update({ fontFamily: f.value })}
                className={cn(
                  "px-3 py-3 rounded-xl border text-sm font-medium transition-all",
                  f.preview,
                  settings.fontFamily === f.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Font Size */}
        <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <h2 className="font-display text-base font-semibold mb-3">Font Size</h2>
          <div className="grid grid-cols-4 gap-2">
            {fontSizes.map((s) => (
              <button
                key={s.value}
                onClick={() => update({ fontSize: s.value })}
                className={cn(
                  "px-2 py-2.5 rounded-xl border text-xs font-medium transition-all",
                  settings.fontSize === s.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Language */}
        <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Language
          </h2>
          <div className="space-y-2">
            {languages.map((l) => (
              <button
                key={l.value}
                onClick={() => !l.disabled && update({ language: l.value as "en" })}
                disabled={l.disabled}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                  settings.language === l.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground",
                  l.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="text-lg">{l.flag}</span>
                {l.label}
                {l.disabled && <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </h2>
          <div className="bg-card rounded-xl p-4 border border-border space-y-5">
            {REMINDERS.map((r) => (
              <div key={r.kind} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.hint}</p>
                  </div>
                  <Switch
                    checked={Boolean(settings[r.enabledKey])}
                    onCheckedChange={(c) => toggleReminder(r, c)}
                  />
                </div>
                {settings[r.enabledKey] && (
                  <input
                    type="time"
                    value={settings[r.timeKey] as string}
                    onChange={(e) => changeReminderTime(r, e.target.value)}
                    className="bg-muted border border-border rounded-lg px-3 py-2 text-sm w-full"
                  />
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full rounded-lg" onClick={sendTest}>
              Send a test notification
            </Button>
            <p className="text-xs text-muted-foreground">
              Notifications are delivered to your device notification centre. Add Devotly to your home screen for the most reliable delivery.
            </p>
          </div>
        </motion.section>

        {/* Bible translation */}
        <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Bible Translation
          </h2>
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <select
              value={settings.bibleTranslation}
              onChange={(e) => update({ bibleTranslation: e.target.value as BibleTranslation })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            >
              {BIBLE_TRANSLATIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Also show verses in (up to 3):</p>
            <div className="flex flex-wrap gap-2">
              {BIBLE_TRANSLATIONS.filter((t) => t.value !== settings.bibleTranslation).map((t) => {
                const on = settings.compareTranslations.includes(t.value);
                return (
                  <button
                    key={t.value}
                    onClick={() => update({
                      compareTranslations: on
                        ? settings.compareTranslations.filter((x) => x !== t.value)
                        : [...settings.compareTranslations, t.value].slice(0, 3),
                    })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium ${on ? "border-primary bg-primary/10 text-foreground" : "border-border bg-muted text-muted-foreground"}`}
                  >
                    {t.value}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Account */}
        <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
            <LogOut className="h-4 w-4 text-primary" /> Account
          </h2>
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={async () => {
                await signOut();
                navigate("/auth");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default Settings;
