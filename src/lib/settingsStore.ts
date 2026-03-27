export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: "en";
  fontFamily: "serif" | "sans" | "mono";
  fontSize: "sm" | "md" | "lg" | "xl";
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:mm
}

const SETTINGS_KEY = "app_settings";

const defaults: AppSettings = {
  theme: "system",
  language: "en",
  fontFamily: "serif",
  fontSize: "md",
  dailyReminderEnabled: false,
  dailyReminderTime: "07:00",
};

export function getSettings(): AppSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...defaults, ...JSON.parse(data) } : defaults;
}

export function updateSettings(partial: Partial<AppSettings>) {
  const current = getSettings();
  const updated = { ...current, ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  applyTheme(updated.theme);
  applyFont(updated.fontFamily, updated.fontSize);
  return updated;
}

export function applyTheme(theme: AppSettings["theme"]) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

export function applyFont(family: AppSettings["fontFamily"], size: AppSettings["fontSize"]) {
  const root = document.documentElement;
  root.setAttribute("data-font", family);
  root.setAttribute("data-font-size", size);
}

// Initialize on load
export function initSettings() {
  const settings = getSettings();
  applyTheme(settings.theme);
  applyFont(settings.fontFamily, settings.fontSize);
}
