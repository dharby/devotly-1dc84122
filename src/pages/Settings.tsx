import { useState } from "react";
import { ChevronLeft, Sun, Moon, Monitor, Type, Globe, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getSettings, updateSettings, type AppSettings } from "@/lib/settingsStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { requestNotificationPermission, scheduleDailyReminder, cancelDailyReminder, showNotification, notificationsSupported } from "@/lib/notifications";

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

  const toggleReminder = async (checked: boolean) => {
    if (checked) {
      if (!notificationsSupported()) { toast.error("Notifications not supported on this device"); return; }
      const perm = await requestNotificationPermission();
      if (perm !== "granted") { toast.error("Please allow notifications in your browser"); return; }
      update({ dailyReminderEnabled: true });
      scheduleDailyReminder(settings.dailyReminderTime);
      toast.success(`Daily reminder set for ${settings.dailyReminderTime}`);
    } else {
      update({ dailyReminderEnabled: false });
      cancelDailyReminder();
    }
  };

  const changeReminderTime = (time: string) => {
    update({ dailyReminderTime: time });
    if (settings.dailyReminderEnabled) scheduleDailyReminder(time);
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

      <div className="px-6 pt-6 space-y-8 animate-fade-in">
        {/* Theme */}
        <section>
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
        </section>

        {/* Font Family */}
        <section>
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
        </section>

        {/* Font Size */}
        <section>
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
        </section>

        {/* Language */}
        <section>
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
        </section>

        {/* Daily Reminder */}
        <section>
          <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Daily Reminder
          </h2>
          <div className="bg-card rounded-xl p-4 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable daily reminder</span>
              <Switch
                checked={settings.dailyReminderEnabled}
                onCheckedChange={toggleReminder}
              />
            </div>
            {settings.dailyReminderEnabled && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Reminder time</label>
                  <input
                    type="time"
                    value={settings.dailyReminderTime}
                    onChange={(e) => changeReminderTime(e.target.value)}
                    className="bg-muted border border-border rounded-lg px-3 py-2 text-sm w-full"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full rounded-lg" onClick={sendTest}>
                  Send a test notification
                </Button>
              </>
            )}
            <p className="text-xs text-muted-foreground">
              {settings.dailyReminderEnabled
                ? "You'll receive a notification at the time above. Add Devotly to your home screen for the most reliable delivery."
                : "Turn on to get daily devotional reminders. Install as PWA for background delivery."}
            </p>
          </div>
        </section>
        {/* Account */}
        <section>
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
        </section>
      </div>
    </div>
  );
};

export default Settings;
